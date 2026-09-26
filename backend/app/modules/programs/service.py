import re
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, delete
from fastapi import HTTPException, status

from app.models import Program, Course, ProgramCourse, User, AuditLog
from . import schema


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "program"


async def generate_unique_slug(db: AsyncSession, name: str, exclude_id: Optional[UUID] = None) -> str:
    base_slug = slugify(name)[:180]
    slug = base_slug
    counter = 1
    while True:
        query = select(Program).where(Program.slug == slug)
        if exclude_id:
            query = query.where(Program.id != exclude_id)
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{base_slug[:175]}-{counter}"
        counter += 1


async def get_programs(
    db: AsyncSession,
    level: Optional[str] = None,
    degree: Optional[str] = None,
    include_inactive: bool = False
) -> Tuple[List[Program], int]:
    query = select(Program).where(Program.deleted_at.is_(None))
    if not include_inactive:
        query = query.where(Program.is_active.is_(True))
    if level:
        query = query.where(Program.level.ilike(level.strip()))
    if degree:
        query = query.where(Program.degree.ilike(degree.strip()))

    query = query.order_by(Program.display_order.asc(), Program.degree.asc(), Program.name.asc())
    result = await db.execute(query)
    programs = result.scalars().all()
    return programs, len(programs)


async def get_program_by_slug(
    db: AsyncSession,
    slug: str,
    include_inactive: bool = False
) -> Dict[str, Any]:
    query = select(Program).where(Program.slug == slug, Program.deleted_at.is_(None))
    if not include_inactive:
        query = query.where(Program.is_active.is_(True))

    res = await db.execute(query)
    program = res.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    # Fetch linked courses grouped by semester
    c_query = (
        select(ProgramCourse, Course)
        .join(Course, ProgramCourse.course_id == Course.id)
        .where(ProgramCourse.program_id == program.id, Course.deleted_at.is_(None))
        .order_by(ProgramCourse.semester.asc(), Course.code.asc())
    )
    c_res = await db.execute(c_query)
    curriculum: Dict[int, List[Dict[str, Any]]] = {}

    for pc, course in c_res.all():
        sem = pc.semester or 1
        if sem not in curriculum:
            curriculum[sem] = []
        curriculum[sem].append({
            "course_id": course.id,
            "course_code": course.code,
            "course_name": course.name,
            "course_slug": course.slug,
            "credits": float(course.credits) if course.credits is not None else None,
            "course_type": course.course_type,
            "category": course.category,
            "semester": sem,
            "is_mandatory": pc.is_mandatory
        })

    return {
        "id": program.id,
        "slug": program.slug,
        "code": program.code,
        "name": program.name,
        "short_name": program.short_name,
        "degree": program.degree,
        "level": program.level,
        "duration_years": float(program.duration_years) if program.duration_years is not None else None,
        "total_credits": program.total_credits,
        "description": program.description,
        "eligibility": program.eligibility,
        "admission_process": program.admission_process,
        "career_opportunities": program.career_opportunities,
        "program_outcomes": program.program_outcomes or [],
        "program_specific_outcomes": program.program_specific_outcomes or [],
        "cover_image_url": program.cover_image_url,
        "brochure_url": program.brochure_url,
        "is_active": program.is_active,
        "display_order": program.display_order,
        "created_at": program.created_at,
        "updated_at": program.updated_at,
        "curriculum": curriculum
    }


async def create_program(
    db: AsyncSession,
    data: schema.ProgramCreate,
    user: User
) -> Program:
    # Rule 2: Code must be unique
    norm_code = data.code.strip().upper()
    existing_code = await db.execute(
        select(Program).where(func.upper(Program.code) == norm_code, Program.deleted_at.is_(None))
    )
    if existing_code.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Program with code '{norm_code}' already exists"
        )

    slug = await generate_unique_slug(db, data.name)

    program = Program(
        slug=slug,
        code=norm_code,
        name=data.name.strip(),
        short_name=data.short_name,
        degree=data.degree,
        level=data.level,
        duration_years=data.duration_years,
        total_credits=data.total_credits,
        description=data.description,
        eligibility=data.eligibility,
        admission_process=data.admission_process,
        career_opportunities=data.career_opportunities,
        program_outcomes=data.program_outcomes or [],
        program_specific_outcomes=data.program_specific_outcomes or [],
        cover_image_url=data.cover_image_url,
        brochure_url=data.brochure_url,
        is_active=data.is_active if data.is_active is not None else True,
        display_order=data.display_order or 0
    )
    db.add(program)
    db.add(AuditLog(
        actor_id=user.id,
        action="create_program",
        resource_type="program",
        resource_id=str(program.id),
        payload={"code": norm_code, "slug": slug}
    ))
    await db.commit()
    await db.refresh(program)
    return program


async def update_program(
    db: AsyncSession,
    id: UUID,
    data: schema.ProgramUpdate,
    user: User
) -> Program:
    res = await db.execute(select(Program).where(Program.id == id, Program.deleted_at.is_(None)))
    program = res.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    update_dict = data.dict(exclude_unset=True)

    if "code" in update_dict and update_dict["code"]:
        norm_code = update_dict["code"].strip().upper()
        if norm_code != program.code:
            existing = await db.execute(
                select(Program).where(
                    func.upper(Program.code) == norm_code,
                    Program.id != id,
                    Program.deleted_at.is_(None)
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Program with code '{norm_code}' already exists"
                )
        update_dict["code"] = norm_code

    if "name" in update_dict and update_dict["name"] != program.name:
        program.slug = await generate_unique_slug(db, update_dict["name"], exclude_id=id)

    for field, val in update_dict.items():
        setattr(program, field, val)

    program.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="update_program",
        resource_type="program",
        resource_id=str(program.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(program)
    return program


async def delete_program(
    db: AsyncSession,
    id: UUID,
    user: User
) -> None:
    res = await db.execute(select(Program).where(Program.id == id, Program.deleted_at.is_(None)))
    program = res.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    program.deleted_at = datetime.utcnow()
    program.is_active = False

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_program",
        resource_type="program",
        resource_id=str(program.id),
        payload={"code": program.code, "slug": program.slug}
    ))
    await db.commit()


async def add_program_course(
    db: AsyncSession,
    program_id: UUID,
    data: schema.ProgramCourseMap,
    user: User
) -> ProgramCourse:
    # Check program
    p_res = await db.execute(select(Program).where(Program.id == program_id, Program.deleted_at.is_(None)))
    if not p_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    # Check course
    c_res = await db.execute(select(Course).where(Course.id == data.course_id, Course.deleted_at.is_(None)))
    if not c_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Check duplicate
    dup_res = await db.execute(
        select(ProgramCourse).where(
            ProgramCourse.program_id == program_id,
            ProgramCourse.course_id == data.course_id
        )
    )
    if dup_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course is already mapped to this program"
        )

    pc = ProgramCourse(
        program_id=program_id,
        course_id=data.course_id,
        semester=data.semester,
        is_mandatory=data.is_mandatory if data.is_mandatory is not None else True
    )
    db.add(pc)
    db.add(AuditLog(
        actor_id=user.id,
        action="add_program_course",
        resource_type="program_course",
        resource_id=str(program_id),
        payload={"course_id": str(data.course_id), "semester": data.semester}
    ))
    await db.commit()
    await db.refresh(pc)
    return pc


async def remove_program_course(
    db: AsyncSession,
    program_id: UUID,
    course_id: UUID,
    user: User
) -> None:
    res = await db.execute(
        select(ProgramCourse).where(
            ProgramCourse.program_id == program_id,
            ProgramCourse.course_id == course_id
        )
    )
    pc = res.scalar_one_or_none()
    if not pc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course mapping not found for this program"
        )

    await db.execute(
        delete(ProgramCourse).where(
            ProgramCourse.program_id == program_id,
            ProgramCourse.course_id == course_id
        )
    )
    db.add(AuditLog(
        actor_id=user.id,
        action="remove_program_course",
        resource_type="program_course",
        resource_id=str(program_id),
        payload={"course_id": str(course_id)}
    ))
    await db.commit()
