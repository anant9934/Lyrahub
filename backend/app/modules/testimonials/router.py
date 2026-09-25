from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
import math

from app.core.dependencies import get_current_user, get_optional_current_user
from app.core.database import get_db
from app.models import User
from app.core.rbac import get_enforcer
from . import schema
from . import service

router = APIRouter(tags=["testimonials"])


async def _get_role(user: User) -> str:
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            if "Admin" in roles or "admin" in roles:
                return "admin"
            if "HOD" in roles or "hod" in roles:
                return "hod"
            if "Faculty" in roles or "faculty" in roles:
                return "faculty"
    except Exception:
        pass
    return "student"


@router.get("", response_model=schema.TestimonialListResponse)
async def list_testimonials(
    author_type: Optional[str] = None,
    context: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_unpublished = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_unpublished = True

    items, total = await service.get_testimonials(
        db=db,
        author_type=author_type,
        context=context,
        featured=featured,
        page=page,
        page_size=page_size,
        can_view_unpublished=can_view_unpublished
    )

    pages = math.ceil(total / page_size) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }


@router.get("/pending", response_model=schema.TestimonialListResponse)
async def get_pending_testimonials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can view pending testimonials"
        )

    items, total = await service.get_pending_testimonials(db, page=page, page_size=page_size)
    pages = math.ceil(total / page_size) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages
    }


@router.get("/stats", response_model=schema.TestimonialStatsResponse)
async def get_testimonials_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_testimonial_stats(db)


@router.get("/{id}", response_model=schema.TestimonialResponse)
async def get_testimonial(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_unpublished = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_unpublished = True

    return await service.get_testimonial_by_id(db, id, can_view_unpublished)


@router.post("", response_model=schema.TestimonialResponse, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    data: schema.TestimonialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.create_testimonial(db, data, current_user)


@router.patch("/{id}", response_model=schema.TestimonialResponse)
async def update_testimonial(
    id: UUID,
    data: schema.TestimonialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.update_testimonial(db, id, data, current_user, is_admin_or_hod)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    await service.delete_testimonial(db, id, current_user, is_admin_or_hod)
    return None


@router.post("/{id}/approve", response_model=schema.TestimonialResponse)
async def approve_testimonial(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can approve testimonials"
        )
    return await service.approve_testimonial(db, id, current_user)


@router.post("/{id}/reject", response_model=schema.TestimonialResponse)
async def reject_testimonial(
    id: UUID,
    body: Optional[schema.TestimonialReject] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can reject testimonials"
        )
    reason = body.reason if body and body.reason else "Does not meet department guidelines"
    return await service.reject_testimonial(db, id, current_user, reason)


@router.post("/{id}/feature", response_model=schema.TestimonialResponse)
async def feature_testimonial(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can toggle featured testimonials"
        )
    return await service.feature_testimonial(db, id, current_user)
