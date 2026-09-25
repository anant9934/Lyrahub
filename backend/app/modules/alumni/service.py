import json
import logging
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
import uuid
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alumni, AlumniExperience, Student, User, AuditLog
from app.core.security import get_password_hash
from app.core.redis import get_redis
from app.core.rbac import get_enforcer
from . import schema

logger = logging.getLogger(__name__)


async def _enrich_alumni(db: AsyncSession, alumni: Alumni) -> schema.AlumniResponse:
    exp_res = await db.execute(
        select(AlumniExperience)
        .where(AlumniExperience.alumni_id == alumni.id)
        .order_by(AlumniExperience.start_date.desc())
    )
    experiences = [
        schema.AlumniExperienceResponse.model_validate(e)
        for e in exp_res.scalars().all()
    ]

    return schema.AlumniResponse(
        id=alumni.id,
        user_id=alumni.user_id,
        reg_no=alumni.reg_no,
        full_name=alumni.full_name,
        email=alumni.email,
        phone=alumni.phone,
        graduation_year=alumni.graduation_year,
        program=alumni.program,
        degree=alumni.degree,
        current_company=alumni.current_company,
        current_role=alumni.current_role,
        location=alumni.location,
        linkedin_url=alumni.linkedin_url,
        github_url=alumni.github_url,
        portfolio_url=alumni.portfolio_url,
        bio=alumni.bio,
        is_verified=alumni.is_verified if alumni.is_verified is not None else False,
        verified_by=alumni.verified_by,
        verified_at=alumni.verified_at,
        open_to_mentorship=alumni.open_to_mentorship if alumni.open_to_mentorship is not None else False,
        open_to_hiring=alumni.open_to_hiring if alumni.open_to_hiring is not None else False,
        willing_to_visit=alumni.willing_to_visit if alumni.willing_to_visit is not None else False,
        privacy_level=alumni.privacy_level or "public",
        created_at=alumni.created_at,
        updated_at=alumni.updated_at,
        experiences=experiences
    )


async def register_alumni(db: AsyncSession, data: schema.AlumniRegisterRequest) -> schema.AlumniResponse:
    # Rule 2: Email must be unique across users
    existing_user = await db.execute(select(User).where(User.email == data.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="User with this email already exists")

    # Rule 1: Auto-populate from students table if reg_no matches
    full_name = data.full_name
    graduation_year = data.graduation_year
    program = data.program or "B.Tech CSE (AI & ML)"
    degree = data.degree or "B.Tech"

    if data.reg_no:
        s_res = await db.execute(
            select(Student, User.email)
            .join(User, Student.user_id == User.id)
            .where(Student.reg_no == data.reg_no)
        )
        student_row = s_res.first()
        if student_row:
            student, student_email = student_row
            if not full_name:
                name_part = student_email.split('@')[0].replace('.', ' ').title()
                full_name = name_part or f"Alumnus {data.reg_no}"
            if not graduation_year:
                graduation_year = student.expected_graduation.year if student.expected_graduation else 2024

    if not full_name:
        full_name = data.email.split('@')[0].replace('.', ' ').title()
    if not graduation_year:
        graduation_year = datetime.utcnow().year

    now = datetime.utcnow()
    # Create user
    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=get_password_hash(data.password),
        is_active=True,
        created_at=now
    )
    db.add(user)
    await db.flush()

    # Assign Alumni role in Casbin
    enforcer = get_enforcer()
    if enforcer:
        try:
            await enforcer.add_grouping_policy(user.email, "Alumni")
        except Exception as e:
            logger.warning(f"Could not add Casbin policy for {user.email}: {e}")

    # Create Alumni profile
    alumni = Alumni(
        id=uuid.uuid4(),
        user_id=user.id,
        reg_no=data.reg_no,
        full_name=full_name,
        email=data.email,
        phone=data.phone,
        graduation_year=graduation_year,
        program=program,
        degree=degree,
        current_company=data.current_company,
        current_role=data.current_role,
        location=data.location,
        linkedin_url=data.linkedin_url,
        github_url=data.github_url,
        portfolio_url=data.portfolio_url,
        bio=data.bio,
        is_verified=False,
        open_to_mentorship=data.open_to_mentorship,
        open_to_hiring=data.open_to_hiring,
        willing_to_visit=data.willing_to_visit,
        privacy_level=data.privacy_level or "public",
        created_at=now,
        updated_at=now
    )
    db.add(alumni)
    await db.flush()

    # Send verification email (log to console)
    logger.info(f"[EMAIL NOTIFICATION] Alumni verification email sent to {data.email}")

    db.add(AuditLog(
        actor_id=user.id,
        action="register_alumni",
        resource_type="alumni",
        payload={"id": str(alumni.id), "email": alumni.email, "reg_no": alumni.reg_no}
    ))
    await db.commit()
    await db.refresh(alumni)

    return await _enrich_alumni(db, alumni)


async def get_alumni_list(
    db: AsyncSession,
    caller_user: Optional[User] = None,
    caller_role: str = "guest",
    graduation_year: Optional[int] = None,
    company: Optional[str] = None,
    program: Optional[str] = None,
    location: Optional[str] = None,
    open_to_mentorship: Optional[bool] = None,
    open_to_hiring: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[schema.AlumniResponse], int]:
    query = select(Alumni).where(Alumni.deleted_at.is_(None))

    # Privacy and verification filters
    if caller_role in ["admin", "hod"]:
        # Can see everything
        pass
    elif caller_role == "alumni":
        # Can see verified with public or alumni_only, plus own profile
        query = query.where(
            or_(
                and_(Alumni.is_verified == True, Alumni.privacy_level.in_(["public", "alumni_only"])),
                Alumni.user_id == caller_user.id if caller_user else False
            )
        )
    else:
        # Students / guests: only verified + public
        query = query.where(Alumni.is_verified == True, Alumni.privacy_level == "public")

    if graduation_year:
        query = query.where(Alumni.graduation_year == graduation_year)
    if company:
        query = query.where(Alumni.current_company.ilike(f"%{company}%"))
    if program:
        query = query.where(Alumni.program == program)
    if location:
        query = query.where(Alumni.location.ilike(f"%{location}%"))
    if open_to_mentorship is not None:
        query = query.where(Alumni.open_to_mentorship == open_to_mentorship)
    if open_to_hiring is not None:
        query = query.where(Alumni.open_to_hiring == open_to_hiring)
    if search:
        s = f"%{search}%"
        query = query.where(
            or_(
                Alumni.full_name.ilike(s),
                Alumni.current_company.ilike(s),
                Alumni.current_role.ilike(s),
                Alumni.bio.ilike(s)
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(Alumni.graduation_year.desc(), Alumni.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    alumni_list = result.scalars().all()

    items = []
    for a in alumni_list:
        items.append(await _enrich_alumni(db, a))

    return items, total


async def get_alumni_by_id(db: AsyncSession, id: UUID) -> schema.AlumniResponse:
    res = await db.execute(select(Alumni).where(Alumni.id == id, Alumni.deleted_at.is_(None)))
    alumni = res.scalar_one_or_none()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    return await _enrich_alumni(db, alumni)


async def get_my_alumni_profile(db: AsyncSession, current_user: User) -> schema.AlumniResponse:
    res = await db.execute(select(Alumni).where(Alumni.user_id == current_user.id, Alumni.deleted_at.is_(None)))
    alumni = res.scalar_one_or_none()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile not found for current user")
    return await _enrich_alumni(db, alumni)


async def update_my_alumni_profile(
    db: AsyncSession,
    current_user: User,
    data: schema.AlumniUpdate
) -> schema.AlumniResponse:
    res = await db.execute(select(Alumni).where(Alumni.user_id == current_user.id, Alumni.deleted_at.is_(None)))
    alumni = res.scalar_one_or_none()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile not found for current user")

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(alumni, k, v)

    alumni.updated_at = datetime.utcnow()
    db.add(AuditLog(
        actor_id=current_user.id,
        action="update_alumni_profile",
        resource_type="alumni",
        payload={"id": str(alumni.id), "updated_fields": list(update_dict.keys())}
    ))
    await db.commit()
    await db.refresh(alumni)
    return await _enrich_alumni(db, alumni)


async def verify_alumni(db: AsyncSession, alumni_id: UUID, current_user: User) -> schema.AlumniResponse:
    res = await db.execute(select(Alumni).where(Alumni.id == alumni_id, Alumni.deleted_at.is_(None)))
    alumni = res.scalar_one_or_none()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni not found")

    alumni.is_verified = True
    alumni.verified_by = current_user.id
    alumni.verified_at = datetime.utcnow()
    alumni.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=current_user.id,
        action="verify_alumni",
        resource_type="alumni",
        payload={"id": str(alumni.id), "verified_by": str(current_user.id)}
    ))
    await db.commit()
    await db.refresh(alumni)
    return await _enrich_alumni(db, alumni)


async def add_experience(
    db: AsyncSession,
    current_user: User,
    data: schema.AlumniExperienceCreate
) -> schema.AlumniExperienceResponse:
    res = await db.execute(select(Alumni).where(Alumni.user_id == current_user.id, Alumni.deleted_at.is_(None)))
    alumni = res.scalar_one_or_none()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile not found for current user")

    exp = AlumniExperience(
        id=uuid.uuid4(),
        alumni_id=alumni.id,
        company=data.company,
        role=data.role,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description,
        created_at=datetime.utcnow()
    )
    db.add(exp)
    db.add(AuditLog(
        actor_id=current_user.id,
        action="add_alumni_experience",
        resource_type="alumni_experience",
        payload={"alumni_id": str(alumni.id), "company": data.company, "role": data.role}
    ))
    await db.commit()
    await db.refresh(exp)

    return schema.AlumniExperienceResponse.model_validate(exp)


async def remove_experience(
    db: AsyncSession,
    current_user: User,
    experience_id: UUID
) -> None:
    res = await db.execute(
        select(AlumniExperience, Alumni.user_id)
        .join(Alumni, AlumniExperience.alumni_id == Alumni.id)
        .where(AlumniExperience.id == experience_id)
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Experience record not found")

    exp, owner_user_id = row
    if owner_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this experience record")

    await db.delete(exp)
    db.add(AuditLog(
        actor_id=current_user.id,
        action="delete_alumni_experience",
        resource_type="alumni_experience",
        payload={"id": str(experience_id)}
    ))
    await db.commit()


async def get_mentors(db: AsyncSession) -> List[schema.AlumniResponse]:
    query = (
        select(Alumni)
        .where(
            Alumni.deleted_at.is_(None),
            Alumni.is_verified == True,
            Alumni.open_to_mentorship == True
        )
        .order_by(Alumni.full_name.asc())
    )
    res = await db.execute(query)
    alumni_list = res.scalars().all()
    items = []
    for a in alumni_list:
        items.append(await _enrich_alumni(db, a))
    return items


async def get_stats(db: AsyncSession) -> schema.AlumniStatsResponse:
    redis = get_redis()
    cache_key = "alumni:stats"
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                data = json.loads(cached)
                return schema.AlumniStatsResponse(**data)
        except Exception:
            pass

    year_res = await db.execute(
        select(Alumni.graduation_year, func.count(Alumni.id))
        .where(Alumni.deleted_at.is_(None), Alumni.is_verified == True)
        .group_by(Alumni.graduation_year)
    )
    by_graduation_year = {str(y): count for y, count in year_res.all()}

    company_res = await db.execute(
        select(Alumni.current_company, func.count(Alumni.id))
        .where(Alumni.deleted_at.is_(None), Alumni.is_verified == True, Alumni.current_company.is_not(None))
        .group_by(Alumni.current_company)
    )
    by_company = {c: count for c, count in company_res.all()}

    program_res = await db.execute(
        select(Alumni.program, func.count(Alumni.id))
        .where(Alumni.deleted_at.is_(None), Alumni.is_verified == True, Alumni.program.is_not(None))
        .group_by(Alumni.program)
    )
    by_program = {p: count for p, count in program_res.all()}

    total_res = await db.execute(
        select(func.count(Alumni.id)).where(Alumni.deleted_at.is_(None), Alumni.is_verified == True)
    )
    total = total_res.scalar_one()

    resp = schema.AlumniStatsResponse(
        by_graduation_year=by_graduation_year,
        by_company=by_company,
        by_program=by_program,
        total=total
    )

    if redis:
        try:
            await redis.setex(cache_key, 600, json.dumps(resp.model_dump()))
        except Exception:
            pass

    return resp
