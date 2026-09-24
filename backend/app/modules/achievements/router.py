from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.models import User
from . import schema
from . import service

router = APIRouter(prefix="/achievements", tags=["achievements"])

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
    if current_user and current_user.role in ["hod", "admin"]:
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
    return await service.create_achievement(db, data, current_user)

@router.post("/{id}/verify", response_model=schema.AchievementResponse)
async def verify_achievement(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to verify achievements")
    return await service.verify_achievement(db, id, current_user)
