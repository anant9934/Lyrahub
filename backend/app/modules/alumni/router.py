from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models import User
from app.core.rbac import get_enforcer
from . import schema
from . import service

router = APIRouter(tags=["alumni"])


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
            if "Alumni" in roles or "alumni" in roles:
                return "alumni"
    except Exception:
        pass
    return "student"


@router.get("", response_model=schema.AlumniListResponse)
async def list_alumni(
    graduation_year: Optional[int] = None,
    company: Optional[str] = None,
    program: Optional[str] = None,
    location: Optional[str] = None,
    open_to_mentorship: Optional[bool] = None,
    open_to_hiring: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    caller_role = "guest"
    if current_user:
        caller_role = await _get_role(current_user)

    items, total = await service.get_alumni_list(
        db=db,
        caller_user=current_user,
        caller_role=caller_role,
        graduation_year=graduation_year,
        company=company,
        program=program,
        location=location,
        open_to_mentorship=open_to_mentorship,
        open_to_hiring=open_to_hiring,
        search=search,
        page=page,
        page_size=page_size
    )
    return schema.AlumniListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/stats", response_model=schema.AlumniStatsResponse)
async def get_alumni_stats(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_stats(db)


@router.get("/mentors", response_model=List[schema.AlumniResponse])
async def get_alumni_mentors(
    db: AsyncSession = Depends(get_db)
):
    return await service.get_mentors(db)


@router.get("/me", response_model=schema.AlumniResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.get_my_alumni_profile(db, current_user)


@router.patch("/me", response_model=schema.AlumniResponse)
async def update_my_profile(
    data: schema.AlumniUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.update_my_alumni_profile(db, current_user, data)


@router.post("/me/experience", response_model=schema.AlumniExperienceResponse, status_code=status.HTTP_201_CREATED)
async def add_my_experience(
    data: schema.AlumniExperienceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.add_experience(db, current_user, data)


@router.delete("/me/experience/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_experience(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await service.remove_experience(db, current_user, id)


@router.post("/register", response_model=schema.AlumniResponse, status_code=status.HTTP_201_CREATED)
async def register_alumni(
    data: schema.AlumniRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    return await service.register_alumni(db, data)


@router.post("/{id}/verify", response_model=schema.AlumniResponse)
async def verify_alumni(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to verify alumni")
    return await service.verify_alumni(db, id, current_user)


@router.get("/{id}", response_model=schema.AlumniResponse)
async def get_alumni_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_alumni_by_id(db, id)
