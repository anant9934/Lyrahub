from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import User
from . import schema, service

router = APIRouter()

@router.get("/me", response_model=schema.StudentProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    return await service.get_student_profile(db, current_user.id)

@router.patch("/me", response_model=schema.StudentProfileResponse)
async def update_my_profile(
    updates: schema.StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.update_student_profile(db, current_user.id, updates, current_user.id)

@router.post("/me/skills", status_code=status.HTTP_201_CREATED)
async def add_skill(
    req: schema.AddSkillRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.add_student_skill(db, current_user.id, req)

@router.delete("/me/skills/{skill_id}", status_code=status.HTTP_200_OK)
async def remove_skill(
    skill_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.remove_student_skill(db, current_user.id, skill_id)

@router.post("/me/resume/presign")
async def presign_resume(
    req: schema.PresignResumeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.presign_resume(db, current_user.id, req)

@router.post("/me/resume/{file_id}/confirm")
async def confirm_resume(
    file_id: UUID,
    r2_key: str,
    req: schema.ConfirmResumeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.confirm_resume(db, current_user.id, file_id, r2_key, req)
