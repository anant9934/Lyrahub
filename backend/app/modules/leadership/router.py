import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import User
from app.modules.leadership.schema import (
    LeadershipCreate,
    LeadershipUpdate,
    LeadershipResponse,
    LeadershipStatsResponse
)
from app.modules.leadership import service

router = APIRouter()

@router.get("", response_model=List[LeadershipResponse])
async def list_leadership(
    role: Optional[str] = Query(None, description="Optional role filter: 'hod', 'cos', 'hos'"),
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint to list all leadership profiles."""
    return await service.list_leadership(db, role=role)

@router.get("/{role}/stats", response_model=LeadershipStatsResponse)
async def get_leadership_stats(
    role: str,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint returning department statistics for a leadership post."""
    return await service.get_department_stats(db, role)

@router.get("/{role}", response_model=LeadershipResponse)
async def get_leadership_by_role(
    role: str,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint returning the active leadership profile for a role ('hod', 'cos', 'hos')."""
    return await service.get_leadership_by_role(db, role)

@router.post("", response_model=LeadershipResponse, status_code=status.HTTP_201_CREATED)
async def create_leadership(
    body: LeadershipCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create leadership profile (Admin only)."""
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage leadership profiles"
        )
    return await service.create_leadership(db, body, current_user.id)

@router.patch("/{id}", response_model=LeadershipResponse)
async def update_leadership(
    id: uuid.UUID,
    body: LeadershipUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update leadership profile (Admin only)."""
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage leadership profiles"
        )
    return await service.update_leadership(db, id, body, current_user.id)

@router.delete("/{id}", response_model=Dict[str, Any])
async def delete_leadership(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Soft-delete leadership profile (Admin only)."""
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage leadership profiles"
        )
    return await service.delete_leadership(db, id, current_user.id)
