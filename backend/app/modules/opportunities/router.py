import math
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models import User
from app.core.rbac import get_enforcer
from . import schema, service

router = APIRouter(tags=["opportunities"])


async def _get_role(user: User) -> str:
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["admin", "hod", "faculty", "student", "alumni"]:
                if r in roles:
                    return r
    except Exception:
        pass
    return "student"


def _require_admin_or_hod(role: str):
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can perform this action"
        )


@router.get("", response_model=schema.OpportunityListResponse)
async def list_opportunities(
    opportunity_type: Optional[str] = None,
    mode: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    deadline_after: Optional[datetime] = None,
    verified_only: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_unverified = False
    can_view_inactive = False
    user_id = None

    if current_user:
        user_id = current_user.id
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_unverified = True
            can_view_inactive = True

    p = page if isinstance(page, int) else 1
    ps = page_size if isinstance(page_size, int) else 20

    items, total = await service.get_opportunities(
        db=db,
        opportunity_type=opportunity_type,
        mode=mode,
        location=location,
        search=search,
        deadline_after=deadline_after,
        verified_only=verified_only,
        page=p,
        page_size=ps,
        can_view_unverified=can_view_unverified,
        can_view_inactive=can_view_inactive,
        current_user_id=user_id
    )

    pages = math.ceil(total / ps) if ps > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": p,
        "page_size": ps,
        "pages": pages
    }


@router.get("/stats", response_model=schema.OpportunityStatsResponse)
async def get_opportunity_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_opportunity_stats(db)


@router.get("/upcoming")
async def get_upcoming_opportunities(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    return await service.get_upcoming_opportunities(db=db, limit=limit)


@router.get("/me")
async def get_my_opportunities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.get_my_opportunities(db=db, user=current_user, role=role)


@router.get("/{slug}", response_model=schema.OpportunityResponse)
async def get_opportunity(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_unverified = False
    user_id = None
    if current_user:
        user_id = current_user.id
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_unverified = True

    return await service.get_opportunity_by_slug(
        db=db,
        slug=slug,
        can_view_unverified=can_view_unverified,
        current_user_id=user_id
    )


@router.post("", response_model=schema.OpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    data: schema.OpportunityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.create_opportunity(db=db, data=data, user=current_user, role=role)


@router.patch("/{id}", response_model=schema.OpportunityResponse)
async def update_opportunity(
    id: UUID,
    data: schema.OpportunityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.update_opportunity(
        db=db,
        id=id,
        data=data,
        user=current_user,
        is_admin_or_hod=is_admin_or_hod
    )


@router.delete("/{id}")
async def delete_opportunity(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    await service.delete_opportunity(
        db=db,
        id=id,
        user=current_user,
        is_admin_or_hod=is_admin_or_hod
    )
    return {"message": "Opportunity deleted successfully"}


@router.post("/{id}/verify", response_model=schema.OpportunityResponse)
async def verify_opportunity(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    return await service.verify_opportunity(db=db, id=id, user=current_user)


@router.post("/{id}/apply", response_model=schema.OpportunityApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_opportunity(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can apply to opportunities"
        )
    return await service.apply_to_opportunity(db=db, opportunity_id=id, user=current_user)


@router.delete("/{id}/apply")
async def withdraw_application(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await service.withdraw_application(db=db, opportunity_id=id, user=current_user)
    return {"message": "Application withdrawn successfully"}


@router.patch("/{id}/applications/{student_id}", response_model=schema.OpportunityApplicationResponse)
async def update_application_status(
    id: UUID,
    student_id: UUID,
    data: schema.OpportunityApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    return await service.update_application_status(
        db=db,
        opportunity_id=id,
        student_id=student_id,
        data=data,
        user=current_user
    )


@router.get("/{id}/applications", response_model=List[schema.OpportunityApplicationResponse])
async def get_opportunity_applications(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.get_opportunity_applications(
        db=db,
        opportunity_id=id,
        user=current_user,
        is_admin_or_hod=is_admin_or_hod
    )
