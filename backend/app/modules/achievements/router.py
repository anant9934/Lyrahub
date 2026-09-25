from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models import User
from app.core.rbac import get_enforcer
from . import schema
from . import service

router = APIRouter(tags=["achievements"])


async def _get_role(user: User) -> str:
    """Return the highest Casbin role for user, defaulting to 'student'."""
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


@router.get("", response_model=schema.AchievementListResponse)
async def list_achievements(
    person_type: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    force_verified = True
    if current_user:
        role = await _get_role(current_user)
        if role in ["hod", "admin"]:
            force_verified = False

    items, total = await service.get_achievements(
        db, person_type, category, level, search, page, page_size, force_verified
    )

    return schema.AchievementListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=schema.AchievementResponse, status_code=status.HTTP_201_CREATED)
async def create_achievement(
    data: schema.AchievementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.create_achievement(db, data, current_user, role)


@router.post("/{id}/verify", response_model=schema.AchievementResponse)
async def verify_achievement(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to verify achievements")
    return await service.verify_achievement(db, id, current_user)
