from uuid import UUID
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, and_, or_
from fastapi import HTTPException, status

from app.models import Testimonial, Student, Alumni, Faculty, User, AuditLog
from app.core.rbac import get_enforcer
from . import schema


async def detect_author_info(db: AsyncSession, user: User) -> Tuple[str, str, Optional[str]]:
    """Determine author_type and default name from user role."""
    # Check student
    res_s = await db.execute(select(Student).where(Student.user_id == user.id))
    student = res_s.scalar_one_or_none()
    if student:
        name = user.email.split("@")[0].replace(".", " ").title()
        return "student", name, f"Student ({student.reg_no})"

    # Check alumni
    res_a = await db.execute(select(Alumni).where(Alumni.user_id == user.id, Alumni.deleted_at.is_(None)))
    alumni = res_a.scalar_one_or_none()
    if alumni:
        return "alumni", alumni.full_name, alumni.current_role or f"Alumni '{alumni.graduation_year}"

    # Check faculty
    res_f = await db.execute(select(Faculty).where(Faculty.user_id == user.id))
    faculty = res_f.scalar_one_or_none()
    if faculty:
        name = getattr(faculty, "full_name", None) or user.email.split("@")[0].replace(".", " ").title()
        return "faculty", name, faculty.designation or "Faculty"

    # Check Casbin roles
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            if any(r.lower() in ["admin", "hod", "faculty"] for r in roles):
                return "faculty", user.email.split("@")[0].title(), "Faculty"
    except Exception:
        pass

    name = user.email.split("@")[0].replace(".", " ").title()
    return "student", name, "Student"


async def get_testimonials(
    db: AsyncSession,
    author_type: Optional[str] = None,
    context: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
    can_view_unpublished: bool = False
) -> Tuple[List[Testimonial], int]:
    conditions = [Testimonial.deleted_at.is_(None)]

    if not can_view_unpublished:
        conditions.append(Testimonial.is_published.is_(True))

    if author_type:
        conditions.append(Testimonial.author_type == author_type)

    if context:
        conditions.append(Testimonial.context == context)

    if featured is not None:
        conditions.append(Testimonial.is_featured.is_(featured))

    count_stmt = select(func.count(Testimonial.id)).where(and_(*conditions))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = (
        select(Testimonial)
        .where(and_(*conditions))
        .order_by(
            Testimonial.is_featured.desc(),
            Testimonial.display_order.asc(),
            Testimonial.created_at.desc()
        )
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total


async def get_pending_testimonials(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[Testimonial], int]:
    conditions = [
        Testimonial.deleted_at.is_(None),
        Testimonial.is_published.is_(False)
    ]
    count_stmt = select(func.count(Testimonial.id)).where(and_(*conditions))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    offset = (page - 1) * page_size
    query = (
        select(Testimonial)
        .where(and_(*conditions))
        .order_by(Testimonial.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total


async def get_testimonial_by_id(
    db: AsyncSession,
    id: UUID,
    can_view_unpublished: bool = False
) -> Testimonial:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    if not can_view_unpublished:
        query = query.where(Testimonial.is_published.is_(True))

    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    return testimonial


async def create_testimonial(
    db: AsyncSession,
    data: schema.TestimonialCreate,
    user: User
) -> Testimonial:
    detected_type, default_name, default_role = await detect_author_info(db, user)

    author_name = data.author_name or default_name
    author_role = data.author_role or default_role

    testimonial = Testimonial(
        author_id=user.id,
        author_type=detected_type,
        author_name=author_name,
        author_role=author_role,
        author_photo_url=data.author_photo_url,
        rating=data.rating,
        text=data.text,
        context=data.context or "about_department",
        context_id=data.context_id,
        is_published=False,
        is_featured=False,
        display_order=0
    )
    db.add(testimonial)
    await db.flush()

    db.add(AuditLog(
        actor_id=user.id,
        action="submit_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload={"author_type": testimonial.author_type, "context": testimonial.context}
    ))
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


async def update_testimonial(
    db: AsyncSession,
    id: UUID,
    data: schema.TestimonialUpdate,
    user: User,
    is_admin_or_hod: bool
) -> Testimonial:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    if not is_admin_or_hod:
        if testimonial.author_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this testimonial")
        if testimonial.is_published:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit an already approved testimonial")

    update_dict = data.dict(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(testimonial, field, val)

    testimonial.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="update_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload=update_dict
    ))
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


async def delete_testimonial(
    db: AsyncSession,
    id: UUID,
    user: User,
    is_admin_or_hod: bool
) -> None:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    if not is_admin_or_hod:
        if testimonial.author_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this testimonial")
        if testimonial.is_published:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete an already approved testimonial")

    testimonial.deleted_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="delete_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload={"author_id": str(testimonial.author_id) if testimonial.author_id else None}
    ))
    await db.commit()


async def approve_testimonial(
    db: AsyncSession,
    id: UUID,
    user: User
) -> Testimonial:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    testimonial.is_published = True
    testimonial.moderated_by = user.id
    testimonial.moderated_at = datetime.utcnow()
    testimonial.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="approve_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload={"approved_by": str(user.id)}
    ))
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


async def reject_testimonial(
    db: AsyncSession,
    id: UUID,
    user: User,
    reason: str
) -> Testimonial:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    testimonial.is_published = False
    testimonial.moderated_by = user.id
    testimonial.moderated_at = datetime.utcnow()
    testimonial.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="reject_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload={"reason": reason, "rejected_by": str(user.id)}
    ))
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


async def feature_testimonial(
    db: AsyncSession,
    id: UUID,
    user: User
) -> Testimonial:
    query = select(Testimonial).where(Testimonial.id == id, Testimonial.deleted_at.is_(None))
    result = await db.execute(query)
    testimonial = result.scalar_one_or_none()
    if not testimonial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")

    if not testimonial.is_featured:
        # Check existing featured in this context; limit to max 3
        featured_query = (
            select(Testimonial)
            .where(
                Testimonial.context == testimonial.context,
                Testimonial.is_featured.is_(True),
                Testimonial.deleted_at.is_(None),
                Testimonial.id != testimonial.id
            )
            .order_by(Testimonial.created_at.desc())
        )
        res = await db.execute(featured_query)
        existing_featured = list(res.scalars().all())

        # If already 3 or more featured, un-feature the oldest to keep total at 3 (with this new one)
        if len(existing_featured) >= 3:
            for old_t in existing_featured[2:]:
                old_t.is_featured = False

        testimonial.is_featured = True
    else:
        testimonial.is_featured = False

    testimonial.updated_at = datetime.utcnow()

    db.add(AuditLog(
        actor_id=user.id,
        action="feature_testimonial",
        resource_type="testimonial",
        resource_id=str(testimonial.id),
        payload={"is_featured": testimonial.is_featured, "context": testimonial.context}
    ))
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


async def get_testimonial_stats(db: AsyncSession) -> Dict[str, Any]:
    base_cond = Testimonial.deleted_at.is_(None)

    # By author_type
    type_query = (
        select(Testimonial.author_type, func.count(Testimonial.id))
        .where(base_cond)
        .group_by(Testimonial.author_type)
    )
    res_t = await db.execute(type_query)
    by_author_type = {row[0]: row[1] for row in res_t.all()}

    # Average rating by context
    rating_query = (
        select(Testimonial.context, func.round(func.avg(Testimonial.rating), 2))
        .where(base_cond, Testimonial.rating.isnot(None), Testimonial.is_published.is_(True))
        .group_by(Testimonial.context)
    )
    res_r = await db.execute(rating_query)
    avg_rating_by_context = {row[0]: float(row[1]) for row in res_r.all() if row[0]}

    # Totals
    totals_query = select(
        func.count(Testimonial.id),
        func.count(func.nullif(Testimonial.is_published, False)),
        func.count(func.nullif(Testimonial.is_published, True))
    ).where(base_cond)
    tot_res = await db.execute(totals_query)
    total_testimonials, total_published, total_pending = tot_res.one()

    return {
        "by_author_type": by_author_type,
        "avg_rating_by_context": avg_rating_by_context,
        "total_testimonials": total_testimonials or 0,
        "total_published": total_published or 0,
        "total_pending": total_pending or 0
    }
