import re
import math
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, delete, or_
from fastapi import HTTPException, status

from app.models import Course, CourseFaculty, ProgramCourse, Program, User, Student, Faculty, AuditLog
from . import schema


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "course"


async def generate_unique_slug(db: AsyncSession, name: str, exclude_id: Optional[UUID] = None) -> str:
    base_slug = slugify(name)[:180]
    slug = base_slug
    counter = 1
    while True:
        query = select(Course).where(Course.slug == slug)
        if exclude_id:
            query = query.where(Course.id != exclude_id)
        result = await db.execute(query)
        existing = result.scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{base_slug[:175]}-{counter}"
        counter += 1


async def get_courses(
    db: AsyncSession,
    semester: Optional[int] = None,
    course_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    include_inactive: bool = False
) -> Tuple[List[Course], int]:
    conditions = [Course.deleted_at.is_(None)]
    if not include_inactive:
        conditions.append(Course.is_active.is_(True))
    if semester:
        conditions.append(Course.semester == semester)
    if course_type:
        conditions.append(Course.course_type.ilike(course_type.strip()))
    if category:
        conditions.append(Course.category.ilike(category.strip()))
    if search:
        s = f"%{search.strip()}%"
        conditions.append(
            or_(
                Course.name.ilike(s),
                Course.code.ilike(s),
                Course.description.ilike(s)
            )
        )

    count_q = select(func.count(Course.id)).where(and_(*conditions))
    total = (await db.execute(count_q)).scalar_one()

    offset = (page - 1) * page_size
    query = (
        select(Course)
        .where(and_(*conditions))
        .order_by(Course.semester.asc().nullslast(), Course.code.asc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = result.scalars().all()
    return items, total


async def get_course_by_slug(
    db: AsyncSession,
    slug: str,
    include_inactive: bool = False
) -> Dict[str, Any]:
    query = select(Course).where(Course.slug == slug, Course.deleted_at.is_(None))
    if not include_inactive:
        query = query.where(Course.is_active.is_(True))

    res = await db.execute(query)
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Fetch assigned faculty
    f_query = (
        select(CourseFaculty, User.email)
        .join(User, CourseFaculty.faculty_id == User.id)
        .where(CourseFaculty.course_id == course.id)
    )
    f_res = await db.execute(f_query)
    faculty_list = []
    for cf, email in f_res.all():
        name = email.split("@")[0].replace(".", " ").title() if email else "Faculty"
        faculty_list.append({
            "id": cf.id,
            "course_id": cf.course_id,
            "faculty_id": cf.faculty_id,
            "faculty_name": name,
            "faculty_email": email,
            "faculty_designation": "Faculty Member",
            "academic_year": cf.academic_year,
            "section": cf.section,
            "role": cf.role
        })

    # Fetch programs that include this course
    p_query = (
        select(ProgramCourse, Program)
        .join(Program, ProgramCourse.program_id == Program.id)
        .where(ProgramCourse.course_id == course.id, Program.deleted_at.is_(None))
    )
    p_res = await db.execute(p_query)
    programs_list = []
    for pc, prog in p_res.all():
        programs_list.append({
            "program_id": prog.id,
            "program_name": prog.name,
            "program_slug": prog.slug,
            "degree": prog.degree,
            "semester": pc.semester,
            "is_mandatory": pc.is_mandatory
        })

    return {
        "id": course.id,
        "slug": course.slug,
        "code": course.code,
        "name": course.name,
        "short_name": course.short_name,
        "description": course.description,
        "credits": float(course.credits) if course.credits is not None else None,
        "semester": course.semester,
        "year": course.year,
        "course_type": course.course_type,
        "category": course.category,
        "prerequisites": course.prerequisites,
        "syllabus": course.syllabus,
        "ip_lp_notes": course.ip_lp_notes,
        "learning_outcomes": course.learning_outcomes or [],
        "evaluation_scheme": course.evaluation_scheme or {},
        "references": course.references or [],
        "edurev_benefits": course.edurev_benefits or [],
        "is_active": course.is_active,
        "created_at": course.created_at,
        "updated_at": course.updated_at,
        "faculty": faculty_list,
        "programs": programs_list
    }


async def get_course_by_code(
    db: AsyncSession,
    code: str,
    include_inactive: bool = False
) -> Dict[str, Any]:
    norm_code = code.strip().upper()
    query = select(Course).where(func.upper(Course.code) == norm_code, Course.deleted_at.is_(None))
    if not include_inactive:
        query = query.where(Course.is_active.is_(True))

    res = await db.execute(query)
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course with code '{norm_code}' not found")

    return await get_course_by_slug(db, course.slug, include_inactive=include_inactive)


async def create_course(
    db: AsyncSession,
    data: schema.CourseCreate,
    user: User
) -> Course:
    # Rule 2: Course code unique, uppercase
    norm_code = data.code.strip().upper()
    existing_code = await db.execute(
        select(Course).where(func.upper(Course.code) == norm_code, Course.deleted_at.is_(None))
    )
    if existing_code.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Course with code '{norm_code}' already exists"
        )

    slug = await generate_unique_slug(db, data.name)

    course = Course(
        slug=slug,
        code=norm_code,
        name=data.name.strip(),
        short_name=data.short_name,
        description=data.description,
        credits=data.credits,
        semester=data.semester,
        year=data.year or (math.ceil(data.semester / 2) if data.semester else 1),
        course_type=data.course_type or "core",
        category=data.category or "theory",
        prerequisites=data.prerequisites,
        syllabus=data.syllabus,
        ip_lp_notes=data.ip_lp_notes,
        learning_outcomes=data.learning_outcomes or [],
        evaluation_scheme=data.evaluation_scheme or {},
        references=data.references or [],
        edurev_benefits=data.edurev_benefits or [],
        is_active=data.is_active if data.is_active is not None else True
    )
    db.add(course)
    db.add(AuditLog(
        actor_id=user.id,
        action="create_course",
        resource_type="course",
        resource_id=str(course.id),
        payload={"code": norm_code, "slug": slug}
    ))
    await db.commit()
    await db.refresh(course)
    return course


async def update_course(
    db: AsyncSession,
    id: UUID,
    data: schema.CourseUpdate,
    user: User
) -> Course:
    res = await db.execute(select(Course).where(Course.id == id, Course.deleted_at.is_(None)))
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    update_dict = data.dict(exclude_unset=True)

    if "code" in update_dict and update_dict["code"]:
        norm_code = update_dict["code"].strip().upper()
        if norm_code != course.code:
            existing = await db.execute(
                select(Course).where(
                    func.upper(Course.code) == norm_code,
                    Course.id != id,
                    Course.deleted_at.is_(None)
                )
            )
            if existing.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Course with code '{norm_code}' already exists"
                )
        update_dict["code"] = norm_code

    if "name" in update_dict and update_dict["name"] != course.name:
        course.slug = await generate_unique_slug(db, update_dict["name"], exclude_id=id)

    for field, val in update_dict.items():
        setattr(course, field, val)

    course.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="update_course",
        resource_type="course",
        resource_id=str(course.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course(
    db: AsyncSession,
    id: UUID,
    user: User
) -> None:
    res = await db.execute(select(Course).where(Course.id == id, Course.deleted_at.is_(None)))
    course = res.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    course.deleted_at = datetime.utcnow()
    course.is_active = False

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_course",
        resource_type="course",
        resource_id=str(course.id),
        payload={"code": course.code, "slug": course.slug}
    ))
    await db.commit()


async def assign_course_faculty(
    db: AsyncSession,
    course_id: UUID,
    data: schema.CourseFacultyAssign,
    user: User
) -> CourseFaculty:
    # Check course
    c_res = await db.execute(select(Course).where(Course.id == course_id, Course.deleted_at.is_(None)))
    if not c_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Check faculty user exists
    f_res = await db.execute(select(User).where(User.id == data.faculty_id))
    if not f_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty user not found")

    # Rule 3: Same faculty cannot have duplicate assignment for same year/section
    dup_res = await db.execute(
        select(CourseFaculty).where(
            CourseFaculty.course_id == course_id,
            CourseFaculty.faculty_id == data.faculty_id,
            CourseFaculty.academic_year == data.academic_year,
            CourseFaculty.section == data.section
        )
    )
    if dup_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Faculty is already assigned to this course for the specified academic year and section"
        )

    cf = CourseFaculty(
        course_id=course_id,
        faculty_id=data.faculty_id,
        academic_year=data.academic_year or "2025-26",
        section=data.section or "A",
        role=data.role or "primary"
    )
    db.add(cf)
    db.add(AuditLog(
        actor_id=user.id,
        action="assign_course_faculty",
        resource_type="course_faculty",
        resource_id=str(course_id),
        payload={"faculty_id": str(data.faculty_id), "academic_year": cf.academic_year, "section": cf.section}
    ))
    await db.commit()
    await db.refresh(cf)
    return cf


async def remove_course_faculty(
    db: AsyncSession,
    course_id: UUID,
    faculty_id: UUID,
    user: User
) -> None:
    res = await db.execute(
        select(CourseFaculty).where(
            CourseFaculty.course_id == course_id,
            CourseFaculty.faculty_id == faculty_id
        )
    )
    cf = res.scalar_one_or_none()
    if not cf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty assignment not found for this course")

    await db.execute(
        delete(CourseFaculty).where(
            CourseFaculty.course_id == course_id,
            CourseFaculty.faculty_id == faculty_id
        )
    )
    db.add(AuditLog(
        actor_id=user.id,
        action="remove_course_faculty",
        resource_type="course_faculty",
        resource_id=str(course_id),
        payload={"faculty_id": str(faculty_id)}
    ))
    await db.commit()


async def get_course_faculty_list(
    db: AsyncSession,
    course_id: UUID
) -> List[Dict[str, Any]]:
    query = (
        select(CourseFaculty, User.email)
        .join(User, CourseFaculty.faculty_id == User.id)
        .where(CourseFaculty.course_id == course_id)
        .order_by(CourseFaculty.academic_year.desc(), CourseFaculty.section.asc())
    )
    res = await db.execute(query)
    results = []
    for cf, email in res.all():
        name = email.split("@")[0].replace(".", " ").title() if email else "Faculty"
        results.append({
            "id": cf.id,
            "course_id": cf.course_id,
            "faculty_id": cf.faculty_id,
            "faculty_name": name,
            "faculty_email": email,
            "faculty_designation": "Faculty Member",
            "academic_year": cf.academic_year,
            "section": cf.section,
            "role": cf.role
        })
    return results


async def get_my_courses(
    db: AsyncSession,
    user: User,
    role: str
) -> List[Course]:
    if role in ["faculty", "hod", "admin"]:
        query = (
            select(Course)
            .join(CourseFaculty, CourseFaculty.course_id == Course.id)
            .where(CourseFaculty.faculty_id == user.id, Course.deleted_at.is_(None))
            .order_by(Course.code.asc())
        )
        res = await db.execute(query)
        return res.scalars().all()

    # For student: find semester
    s_res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = s_res.scalar_one_or_none()
    if student:
        sem = student.current_semester or (student.semester if hasattr(student, "semester") else 5) or 5
        query = select(Course).where(Course.semester == sem, Course.deleted_at.is_(None), Course.is_active.is_(True)).order_by(Course.code.asc())
        res = await db.execute(query)
        return res.scalars().all()

    # Default to semester 1
    query = select(Course).where(Course.semester == 1, Course.deleted_at.is_(None), Course.is_active.is_(True)).order_by(Course.code.asc())
    res = await db.execute(query)
    return res.scalars().all()


async def get_course_stats(db: AsyncSession) -> Dict[str, Any]:
    # By semester
    sem_res = await db.execute(
        select(Course.semester, func.count(Course.id))
        .where(Course.deleted_at.is_(None))
        .group_by(Course.semester)
    )
    by_sem = {f"sem_{row[0]}": row[1] for row in sem_res.all() if row[0] is not None}

    # By type
    type_res = await db.execute(
        select(Course.course_type, func.count(Course.id))
        .where(Course.deleted_at.is_(None))
        .group_by(Course.course_type)
    )
    by_type = {row[0] or "other": row[1] for row in type_res.all()}

    # By category
    cat_res = await db.execute(
        select(Course.category, func.count(Course.id))
        .where(Course.deleted_at.is_(None))
        .group_by(Course.category)
    )
    by_cat = {row[0] or "other": row[1] for row in cat_res.all()}

    total_courses = sum(by_type.values())

    return {
        "by_semester": by_sem,
        "by_type": by_type,
        "by_category": by_cat,
        "total_courses": total_courses
    }
