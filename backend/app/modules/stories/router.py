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

router = APIRouter(tags=["stories"])


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


@router.get("", response_model=schema.StoryListResponse)
async def list_stories(
    story_type: Optional[str] = None,
    batch_year: Optional[int] = None,
    tag: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
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

    items, total = await service.get_stories(
        db=db,
        story_type=story_type,
        batch_year=batch_year,
        tag=tag,
        featured=featured,
        search=search,
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


@router.get("/stats", response_model=schema.StoryStatsResponse)
async def get_stories_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_story_stats(db)


@router.get("/{slug}", response_model=schema.StoryResponse)
async def get_story(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_unpublished = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["admin", "hod", "faculty"]:
            can_view_unpublished = True

    return await service.get_story_by_slug(db, slug, can_view_unpublished)


@router.post("", response_model=schema.StoryResponse, status_code=status.HTTP_201_CREATED)
async def create_story(
    data: schema.StoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["faculty", "hod", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Faculty, HOD, or Admin can create success stories"
        )

    return await service.create_story(db, data, current_user)


@router.patch("/{id}", response_model=schema.StoryResponse)
async def update_story(
    id: UUID,
    data: schema.StoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.update_story(db, id, data, current_user, is_admin_or_hod)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    await service.delete_story(db, id, current_user, is_admin_or_hod)
    return None


@router.post("/{id}/publish", response_model=schema.StoryResponse)
async def publish_story(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.publish_story(db, id, current_user, is_admin_or_hod)


@router.post("/{id}/feature", response_model=schema.StoryResponse)
async def feature_story(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can toggle featured status"
        )
    return await service.feature_story(db, id, current_user)
