import re
import math
import logging
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, delete, or_
from fastapi import HTTPException, status

from app.models import Opportunity, OpportunityApplication, Student, User, AuditLog
from . import schema

logger = logging.getLogger(__name__)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "opportunity"


async def generate_unique_slug(db: AsyncSession, title: str, exclude_id: Optional[UUID] = None) -> str:
    base_slug = slugify(title)[:230]
    slug = base_slug
    counter = 1
    while True:
        query = select(Opportunity).where(Opportunity.slug == slug)
        if exclude_id:
            query = query.where(Opportunity.id != exclude_id)
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{base_slug[:220]}-{counter}"
        counter += 1


async def get_opportunities(
    db: AsyncSession,
    opportunity_type: Optional[str] = None,
    mode: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    deadline_after: Optional[datetime] = None,
    verified_only: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
    can_view_unverified: bool = False,
    can_view_inactive: bool = False,
    current_user_id: Optional[UUID] = None
) -> Tuple[List[Dict[str, Any]], int]:
    conditions = [Opportunity.deleted_at.is_(None)]

    if not can_view_inactive:
        conditions.append(Opportunity.is_active.is_(True))

    now = datetime.now(timezone.utc)
    if not can_view_unverified:
        # Rule 4: Students see only verified + active + before deadline
        if current_user_id:
            conditions.append(
                or_(
                    Opportunity.is_verified.is_(True),
                    Opportunity.posted_by == current_user_id
                )
            )
        else:
            conditions.append(Opportunity.is_verified.is_(True))
        conditions.append(
            or_(
                Opportunity.application_deadline.is_(None),
                Opportunity.application_deadline >= now
            )
        )
    elif verified_only is not None:
        conditions.append(Opportunity.is_verified.is_(verified_only))

    if opportunity_type:
        conditions.append(Opportunity.opportunity_type.ilike(opportunity_type.strip()))
    if mode:
        conditions.append(Opportunity.mode.ilike(mode.strip()))
    if location:
        conditions.append(Opportunity.location.ilike(f"%{location.strip()}%"))
    if deadline_after:
        conditions.append(Opportunity.application_deadline >= deadline_after)
    if search:
        s = f"%{search.strip()}%"
        conditions.append(
            or_(
                Opportunity.title.ilike(s),
                Opportunity.organization.ilike(s),
                Opportunity.description.ilike(s)
            )
        )

    count_q = select(func.count(Opportunity.id)).where(and_(*conditions))
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * page_size
    query = (
        select(Opportunity, User.email)
        .join(User, Opportunity.posted_by == User.id)
        .where(and_(*conditions))
        .order_by(Opportunity.application_deadline.asc().nullslast(), Opportunity.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)

    items = []
    for op, poster_email in result.all():
        poster_name = poster_email.split("@")[0].replace(".", " ").title() if poster_email else "Member"
        # Get count of applicants
        app_count = (await db.execute(
            select(func.count(OpportunityApplication.id)).where(OpportunityApplication.opportunity_id == op.id)
        )).scalar_one()

        items.append({
            "id": op.id,
            "slug": op.slug,
            "title": op.title,
            "organization": op.organization,
            "opportunity_type": op.opportunity_type,
            "mode": op.mode,
            "location": op.location,
            "description": op.description,
            "eligibility": op.eligibility,
            "required_skills": op.required_skills or [],
            "stipend_amount": float(op.stipend_amount) if op.stipend_amount is not None else None,
            "stipend_currency": op.stipend_currency or "INR",
            "duration_weeks": op.duration_weeks,
            "start_date": op.start_date,
            "application_deadline": op.application_deadline,
            "application_url": op.application_url,
            "contact_email": op.contact_email,
            "cover_image_url": op.cover_image_url,
            "tags": op.tags or [],
            "posted_by": op.posted_by,
            "posted_by_name": poster_name,
            "is_active": op.is_active,
            "is_verified": op.is_verified,
            "verified_by": op.verified_by,
            "verified_at": op.verified_at,
            "created_at": op.created_at,
            "updated_at": op.updated_at,
            "applicants_count": app_count
        })

    return items, total


async def get_opportunity_by_slug(
    db: AsyncSession,
    slug: str,
    can_view_unverified: bool = False,
    current_user_id: Optional[UUID] = None
) -> Dict[str, Any]:
    query = (
        select(Opportunity, User.email)
        .join(User, Opportunity.posted_by == User.id)
        .where(Opportunity.slug == slug, Opportunity.deleted_at.is_(None))
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    op, poster_email = row

    if not can_view_unverified and not op.is_verified:
        if not current_user_id or op.posted_by != current_user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found or pending verification")

    poster_name = poster_email.split("@")[0].replace(".", " ").title() if poster_email else "Member"
    app_count = (await db.execute(
        select(func.count(OpportunityApplication.id)).where(OpportunityApplication.opportunity_id == op.id)
    )).scalar_one()

    return {
        "id": op.id,
        "slug": op.slug,
        "title": op.title,
        "organization": op.organization,
        "opportunity_type": op.opportunity_type,
        "mode": op.mode,
        "location": op.location,
        "description": op.description,
        "eligibility": op.eligibility,
        "required_skills": op.required_skills or [],
        "stipend_amount": float(op.stipend_amount) if op.stipend_amount is not None else None,
        "stipend_currency": op.stipend_currency or "INR",
        "duration_weeks": op.duration_weeks,
        "start_date": op.start_date,
        "application_deadline": op.application_deadline,
        "application_url": op.application_url,
        "contact_email": op.contact_email,
        "cover_image_url": op.cover_image_url,
        "tags": op.tags or [],
        "posted_by": op.posted_by,
        "posted_by_name": poster_name,
        "is_active": op.is_active,
        "is_verified": op.is_verified,
        "verified_by": op.verified_by,
        "verified_at": op.verified_at,
        "created_at": op.created_at,
        "updated_at": op.updated_at,
        "applicants_count": app_count
    }


async def create_opportunity(
    db: AsyncSession,
    data: schema.OpportunityCreate,
    user: User,
    role: str
) -> Opportunity:
    # Rule 4: Faculty/HOD/Admin OR Alumni can post. Students cannot.
    if role not in ["faculty", "hod", "admin", "alumni"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Faculty, Alumni, HOD, or Admin can post opportunities"
        )

    slug = await generate_unique_slug(db, data.title)

    op = Opportunity(
        slug=slug,
        title=data.title.strip(),
        organization=data.organization.strip(),
        opportunity_type=data.opportunity_type or "internship",
        mode=data.mode or "remote",
        location=data.location,
        description=data.description,
        eligibility=data.eligibility,
        required_skills=data.required_skills or [],
        stipend_amount=data.stipend_amount,
        stipend_currency=data.stipend_currency or "INR",
        duration_weeks=data.duration_weeks,
        start_date=data.start_date,
        application_deadline=data.application_deadline,
        application_url=data.application_url,
        contact_email=data.contact_email or user.email,
        cover_image_url=data.cover_image_url,
        tags=data.tags or [],
        posted_by=user.id,
        is_active=data.is_active if data.is_active is not None else True,
        is_verified=False # Always false initially until verified by HOD/Admin
    )
    db.add(op)
    db.add(AuditLog(
        actor_id=user.id,
        action="create_opportunity",
        resource_type="opportunity",
        resource_id=str(op.id),
        payload={"title": op.title, "organization": op.organization, "slug": slug}
    ))
    await db.commit()
    await db.refresh(op)
    return op


async def update_opportunity(
    db: AsyncSession,
    id: UUID,
    data: schema.OpportunityUpdate,
    user: User,
    is_admin_or_hod: bool
) -> Opportunity:
    res = await db.execute(select(Opportunity).where(Opportunity.id == id, Opportunity.deleted_at.is_(None)))
    op = res.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    if not is_admin_or_hod and op.posted_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this opportunity")

    update_dict = data.dict(exclude_unset=True)

    if "title" in update_dict and update_dict["title"] != op.title:
        op.slug = await generate_unique_slug(db, update_dict["title"], exclude_id=id)

    for field, val in update_dict.items():
        setattr(op, field, val)

    op.updated_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        actor_id=user.id,
        action="update_opportunity",
        resource_type="opportunity",
        resource_id=str(op.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(op)
    return op


async def delete_opportunity(
    db: AsyncSession,
    id: UUID,
    user: User,
    is_admin_or_hod: bool
) -> None:
    res = await db.execute(select(Opportunity).where(Opportunity.id == id, Opportunity.deleted_at.is_(None)))
    op = res.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    if not is_admin_or_hod and op.posted_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this opportunity")

    op.deleted_at = datetime.now(timezone.utc)
    op.is_active = False

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_opportunity",
        resource_type="opportunity",
        resource_id=str(op.id),
        payload={"slug": op.slug}
    ))
    await db.commit()


async def verify_opportunity(
    db: AsyncSession,
    id: UUID,
    user: User
) -> Opportunity:
    res = await db.execute(select(Opportunity).where(Opportunity.id == id, Opportunity.deleted_at.is_(None)))
    op = res.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    op.is_verified = True
    op.verified_by = user.id
    op.verified_at = datetime.now(timezone.utc)
    op.updated_at = datetime.now(timezone.utc)

    # Rule 6: Auto-notify students via email when a new verified opportunity posted (log only for now)
    logger.info(f"[Notification Logged] New verified opportunity '{op.title}' at '{op.organization}' has been verified by {user.email}")

    db.add(AuditLog(
        actor_id=user.id,
        action="verify_opportunity",
        resource_type="opportunity",
        resource_id=str(op.id),
        payload={"verified_by": str(user.id)}
    ))
    await db.commit()
    await db.refresh(op)
    return op


async def apply_to_opportunity(
    db: AsyncSession,
    opportunity_id: UUID,
    user: User
) -> OpportunityApplication:
    # Must be student
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can apply to opportunities")

    # Check opportunity
    o_res = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id, Opportunity.deleted_at.is_(None)))
    op = o_res.scalar_one_or_none()
    if not op or not op.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found or inactive")

    # Rule 2: Cannot apply after application_deadline
    if op.application_deadline:
        now = datetime.now(timezone.utc)
        deadline = op.application_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if deadline < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application deadline has passed"
            )

    # Check duplicate application
    dup_res = await db.execute(
        select(OpportunityApplication).where(
            OpportunityApplication.opportunity_id == opportunity_id,
            OpportunityApplication.student_id == student.id
        )
    )
    if dup_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied or expressed interest in this opportunity"
        )

    app = OpportunityApplication(
        opportunity_id=opportunity_id,
        student_id=student.id,
        status="interested",
        applied_at=datetime.now(timezone.utc)
    )
    db.add(app)
    db.add(AuditLog(
        actor_id=user.id,
        action="apply_opportunity",
        resource_type="opportunity_application",
        resource_id=str(opportunity_id),
        payload={"student_id": str(student.id)}
    ))
    await db.commit()
    await db.refresh(app)
    return app


async def withdraw_application(
    db: AsyncSession,
    opportunity_id: UUID,
    user: User
) -> None:
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student profile not found")

    res = await db.execute(
        select(OpportunityApplication).where(
            OpportunityApplication.opportunity_id == opportunity_id,
            OpportunityApplication.student_id == student.id
        )
    )
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    await db.execute(
        delete(OpportunityApplication).where(
            OpportunityApplication.opportunity_id == opportunity_id,
            OpportunityApplication.student_id == student.id
        )
    )
    db.add(AuditLog(
        actor_id=user.id,
        action="withdraw_opportunity_application",
        resource_type="opportunity_application",
        resource_id=str(opportunity_id),
        payload={"student_id": str(student.id)}
    ))
    await db.commit()


async def update_application_status(
    db: AsyncSession,
    opportunity_id: UUID,
    student_id: UUID,
    data: schema.OpportunityApplicationUpdate,
    user: User
) -> OpportunityApplication:
    res = await db.execute(
        select(OpportunityApplication).where(
            OpportunityApplication.opportunity_id == opportunity_id,
            OpportunityApplication.student_id == student_id
        )
    )
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app.status = data.status
    if data.notes is not None:
        app.notes = data.notes
    app.updated_at = datetime.now(timezone.utc)

    db.add(AuditLog(
        actor_id=user.id,
        action="update_application_status",
        resource_type="opportunity_application",
        resource_id=str(opportunity_id),
        payload={"student_id": str(student_id), "status": data.status}
    ))
    await db.commit()
    await db.refresh(app)
    return app


async def get_opportunity_applications(
    db: AsyncSession,
    opportunity_id: UUID,
    user: User,
    is_admin_or_hod: bool
) -> List[Dict[str, Any]]:
    # Creator or HOD/Admin check
    o_res = await db.execute(select(Opportunity).where(Opportunity.id == opportunity_id, Opportunity.deleted_at.is_(None)))
    op = o_res.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    if not is_admin_or_hod and op.posted_by != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view applicants")

    query = (
        select(OpportunityApplication, Student.reg_no, User.email)
        .join(Student, OpportunityApplication.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(OpportunityApplication.opportunity_id == opportunity_id)
        .order_by(OpportunityApplication.applied_at.desc())
    )
    res = await db.execute(query)
    results = []
    for app, reg_no, email in res.all():
        name = email.split("@")[0].replace(".", " ").title() if email else "Student"
        results.append({
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "student_id": app.student_id,
            "student_name": name,
            "student_reg_no": reg_no,
            "student_email": email,
            "status": app.status,
            "notes": app.notes,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at
        })
    return results


async def get_my_opportunities(
    db: AsyncSession,
    user: User,
    role: str
) -> Dict[str, Any]:
    if role == "student":
        s_res = await db.execute(select(Student).where(Student.user_id == user.id))
        student = s_res.scalar_one_or_none()
        if not student:
            return {"applications": [], "posted": []}

        q = (
            select(OpportunityApplication, Opportunity)
            .join(Opportunity, OpportunityApplication.opportunity_id == Opportunity.id)
            .where(OpportunityApplication.student_id == student.id)
            .order_by(OpportunityApplication.applied_at.desc())
        )
        res = await db.execute(q)
        apps = []
        for app, op in res.all():
            apps.append({
                "application_id": app.id,
                "opportunity_id": op.id,
                "opportunity_title": op.title,
                "opportunity_slug": op.slug,
                "organization": op.organization,
                "opportunity_type": op.opportunity_type,
                "mode": op.mode,
                "status": app.status,
                "applied_at": app.applied_at
            })
        return {"applications": apps, "posted": []}

    # Faculty/Alumni/Admin/HOD: posted by me
    q = (
        select(Opportunity)
        .where(Opportunity.posted_by == user.id, Opportunity.deleted_at.is_(None))
        .order_by(Opportunity.created_at.desc())
    )
    res = await db.execute(q)
    posted = res.scalars().all()
    return {"applications": [], "posted": posted}


async def get_upcoming_opportunities(
    db: AsyncSession,
    limit: int = 10
) -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    query = (
        select(Opportunity, User.email)
        .join(User, Opportunity.posted_by == User.id)
        .where(
            Opportunity.is_active.is_(True),
            Opportunity.is_verified.is_(True),
            Opportunity.deleted_at.is_(None),
            Opportunity.application_deadline.is_not(None),
            Opportunity.application_deadline >= now
        )
        .order_by(Opportunity.application_deadline.asc())
        .limit(limit)
    )
    res = await db.execute(query)
    results = []
    for op, poster_email in res.all():
        poster_name = poster_email.split("@")[0].replace(".", " ").title() if poster_email else "Member"
        results.append({
            "id": op.id,
            "slug": op.slug,
            "title": op.title,
            "organization": op.organization,
            "opportunity_type": op.opportunity_type,
            "mode": op.mode,
            "location": op.location,
            "stipend_amount": float(op.stipend_amount) if op.stipend_amount is not None else None,
            "stipend_currency": op.stipend_currency or "INR",
            "duration_weeks": op.duration_weeks,
            "application_deadline": op.application_deadline,
            "application_url": op.application_url,
            "cover_image_url": op.cover_image_url,
            "tags": op.tags or [],
            "posted_by_name": poster_name,
            "is_verified": op.is_verified
        })
    return results


async def get_opportunity_stats(db: AsyncSession) -> Dict[str, Any]:
    # By type
    t_res = await db.execute(
        select(Opportunity.opportunity_type, func.count(Opportunity.id))
        .where(Opportunity.deleted_at.is_(None))
        .group_by(Opportunity.opportunity_type)
    )
    by_type = {row[0] or "other": row[1] for row in t_res.all()}

    # By organization
    o_res = await db.execute(
        select(Opportunity.organization, func.count(Opportunity.id))
        .where(Opportunity.deleted_at.is_(None))
        .group_by(Opportunity.organization)
        .order_by(func.count(Opportunity.id).desc())
        .limit(10)
    )
    by_org = {row[0] or "Unknown": row[1] for row in o_res.all()}

    tot_res = await db.execute(
        select(
            func.count(Opportunity.id),
            func.count(Opportunity.id).filter(Opportunity.is_verified.is_(True))
        ).where(Opportunity.deleted_at.is_(None))
    )
    total, verified = tot_res.one()

    return {
        "by_type": by_type,
        "by_organization": by_org,
        "total_opportunities": total,
        "total_verified": verified
    }
