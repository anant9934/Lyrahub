from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models import User
from app.core.rbac import get_enforcer
from . import schema
from . import service

router = APIRouter(tags=["projects"])


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


@router.get("", response_model=schema.ProjectListResponse)
async def list_projects(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    mentor_id: Optional[UUID] = None,
    search: Optional[str] = None,
    year: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    can_view_private = False
    if current_user:
        role = await _get_role(current_user)
        if role in ["faculty", "hod", "admin"]:
            can_view_private = True

    items, total = await service.get_projects(
        db=db,
        domain=domain,
        status=status,
        mentor_id=mentor_id,
        search=search,
        year=year,
        page=page,
        page_size=page_size,
        can_view_private=can_view_private
    )
    return schema.ProjectListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/me", response_model=List[schema.ProjectResponse])
async def get_my_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.get_my_projects(db, current_user, role)


@router.get("/stats", response_model=schema.ProjectStatsResponse)
async def get_project_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_stats(db)


@router.get("/mentor/{mentor_id}", response_model=List[schema.ProjectResponse])
async def get_projects_by_mentor(
    mentor_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_projects_by_mentor(db, mentor_id)


@router.get("/{id_or_slug}", response_model=schema.ProjectResponse)
async def get_project_detail(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_project_by_id_or_slug(db, id_or_slug)


@router.post("", response_model=schema.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: schema.ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.create_project(db, data, current_user, role)


@router.patch("/{id}", response_model=schema.ProjectResponse)
async def update_project(
    id: UUID,
    data: schema.ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.update_project(db, id, data, current_user, role)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    await service.delete_project(db, id, current_user, role)


@router.post("/{id}/members", response_model=schema.ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_project_member(
    id: UUID,
    data: schema.ProjectMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.add_member(db, id, data, current_user, role)


@router.delete("/{id}/members/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    id: UUID,
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    await service.remove_member(db, id, student_id, current_user, role)


@router.post("/{id}/documents", response_model=schema.ProjectDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_project_document(
    id: UUID,
    doc_type: str = Form("report"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    return await service.add_document(db, id, doc_type, file, current_user, role)


@router.get("/{id}/documents", response_model=List[schema.ProjectDocumentResponse])
async def list_project_documents(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.get_project_documents(db, id)
