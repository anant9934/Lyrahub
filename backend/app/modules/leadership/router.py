import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
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
    response: Response = Response(),
    role: Optional[str] = Query(None, description="Optional role filter: 'hod', 'cos', 'hos'"),
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint to list all leadership profiles."""
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    return await service.list_leadership(db, role=role)

@router.get("/{role}/stats", response_model=LeadershipStatsResponse)
async def get_leadership_stats(
    role: str,
    response: Response = Response(),
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint returning department statistics for a leadership post."""
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    return await service.get_department_stats(db, role)

@router.get("/{role}", response_model=LeadershipResponse)
async def get_leadership_by_role(
    role: str,
    response: Response = Response(),
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint returning the active leadership profile for a role ('hod', 'cos', 'hos')."""
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    return await service.get_leadership_by_role(db, role)




async def _require_admin(user: User):
    if user.email in ["admin@aiml.hub"]:
        return "admin"
    try:
        from app.core.rbac import get_enforcer
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["super_admin", "admin"]:
                if r in roles:
                    return r
    except Exception:
        pass
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only administrators can manage leadership profiles"
    )

@router.post("", response_model=LeadershipResponse, status_code=status.HTTP_201_CREATED)
async def create_leadership(
    body: LeadershipCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create leadership profile (Admin only)."""
    await _require_admin(current_user)
    return await service.create_leadership(db, body, current_user.id)

@router.patch("/{id}", response_model=LeadershipResponse)
async def update_leadership(
    id: uuid.UUID,
    body: LeadershipUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update leadership profile (Admin only)."""
    await _require_admin(current_user)
    return await service.update_leadership(db, id, body, current_user.id)

@router.delete("/{id}", response_model=Dict[str, Any])
async def delete_leadership(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Soft-delete leadership profile (Admin only)."""
    await _require_admin(current_user)
    return await service.delete_leadership(db, id, current_user.id)

