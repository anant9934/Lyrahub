from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
import math

from app.core.dependencies import get_current_user, get_optional_current_user
from app.core.database import get_db
from app.models import User, Group, GroupMember, Student
from app.core.rbac import get_enforcer
from sqlalchemy.future import select
from . import schema
from . import service

router = APIRouter(tags=["groups"])


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


async def _is_group_lead_or_advisor_or_admin(db: AsyncSession, group_id: UUID, user: User) -> bool:
    role = await _get_role(user)
    if role in ["admin", "hod"]:
        return True

    # Check advisor
    g_res = await db.execute(select(Group).where(Group.id == group_id))
    group = g_res.scalar_one_or_none()
    if group and group.faculty_advisor_id == user.id:
        return True

    # Check if student is active lead
    s_res = await db.execute(select(Student.id).where(Student.user_id == user.id))
    student_id = s_res.scalar_one_or_none()
    if student_id:
        m_res = await db.execute(
            select(GroupMember).where(
                GroupMember.group_id == group_id,
                GroupMember.student_id == student_id,
                GroupMember.role == "lead",
                GroupMember.is_active.is_(True)
            )
        )
        if m_res.scalar_one_or_none():
            return True

    return False


@router.get("", response_model=schema.GroupListResponse)
async def list_groups(
    group_type: Optional[str] = None,
    category: Optional[str] = None,
    is_official: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_inactive = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_inactive = True

    p = page if isinstance(page, int) else 1
    ps = page_size if isinstance(page_size, int) else 20

    items, total = await service.get_groups(
        db=db,
        group_type=group_type,
        category=category,
        is_official=is_official,
        search=search,
        page=p,
        page_size=ps,
        can_view_inactive=can_view_inactive
    )

    pages = math.ceil(total / ps) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": p,
        "page_size": ps,
        "pages": pages
    }


@router.get("/official", response_model=schema.GroupListResponse)
async def list_official_groups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    p = page if isinstance(page, int) else 1
    ps = page_size if isinstance(page_size, int) else 20

    items, total = await service.get_groups(
        db=db,
        is_official=True,
        page=p,
        page_size=ps
    )
    pages = math.ceil(total / ps) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": p,
        "page_size": ps,
        "pages": pages
    }


@router.get("/me", response_model=List[schema.GroupResponse])
async def get_my_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.get_my_groups(db, current_user)


@router.get("/stats", response_model=schema.GroupStatsResponse)
async def get_groups_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_group_stats(db)


@router.get("/{slug}", response_model=schema.GroupDetailResponse)
async def get_group(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    can_view_inactive = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            can_view_inactive = True

    return await service.get_group_by_slug(db, slug, can_view_inactive)


@router.post("", response_model=schema.GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    data: schema.GroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can create groups"
        )
    return await service.create_group(db, data, current_user)


@router.patch("/{id}", response_model=schema.GroupResponse)
async def update_group(
    id: UUID,
    data: schema.GroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    is_admin_or_hod = role in ["admin", "hod"]
    return await service.update_group(db, id, data, current_user, is_admin_or_hod)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can delete groups"
        )
    await service.delete_group(db, id, current_user)
    return None


@router.post("/{id}/verify", response_model=schema.GroupResponse)
async def verify_group(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can verify official status"
        )
    return await service.verify_group(db, id, current_user)


@router.post("/{id}/join", response_model=schema.GroupMemberResponse, status_code=status.HTTP_201_CREATED)
async def join_group(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.join_group(db, id, current_user)


@router.delete("/{id}/join", status_code=status.HTTP_200_OK)
async def leave_group(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await service.leave_group(db, id, current_user)
    return {"message": "Successfully left group"}


@router.post("/{id}/members", response_model=schema.GroupMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_group_member(
    id: UUID,
    data: schema.GroupMemberAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_auth = await _is_group_lead_or_advisor_or_admin(db, id, current_user)
    return await service.add_group_member(db, id, data, current_user, is_auth)


@router.patch("/{id}/members/{student_id}", response_model=schema.GroupMemberResponse)
async def update_member_role(
    id: UUID,
    student_id: UUID,
    body: schema.GroupMemberRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_auth = await _is_group_lead_or_advisor_or_admin(db, id, current_user)
    return await service.update_member_role(db, id, student_id, body.role, current_user, is_auth)


@router.get("/{id}/members", response_model=List[schema.GroupMemberResponse])
async def list_group_members(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.get_group_members(db, id)


@router.post("/{id}/events", response_model=schema.GroupEventResponse, status_code=status.HTTP_201_CREATED)
async def link_group_event(
    id: UUID,
    body: schema.GroupEventLink,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    is_auth = await _is_group_lead_or_advisor_or_admin(db, id, current_user)
    return await service.link_group_event(db, id, body.event_id, current_user, is_auth)
