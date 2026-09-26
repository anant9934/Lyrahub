from fastapi import APIRouter, Depends, status, HTTPException
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

from app.modules.approvals import service as approvals_service
from app.modules.approvals.schema import ChangeRequestCreate
from app.models import Student
from sqlalchemy.future import select

@router.patch("/me", response_model=schema.StudentUpdateResultResponse)
async def update_my_profile(
    updates: schema.StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if student exists for current_user
    st_res = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = st_res.scalar_one_or_none()
    
    is_hod = current_user.email in ["admin@aiml.hub", "hod@aiml.hub", "720anant@gmail.com"]
    if student and not is_hod:
        # Student updating own profile
        profile = await service.update_student_profile(db, current_user.id, updates, current_user.id)
        return schema.StudentUpdateResultResponse(
            profile=profile,
            status="updated",
            message="Profile updated successfully"
        )
    elif is_hod and student:
        profile = await service.update_student_profile(db, current_user.id, updates, current_user.id)
        return schema.StudentUpdateResultResponse(
            profile=profile,
            status="updated",
            message="Profile updated directly by HOD/Admin"
        )
    else:
        # Non-student user or faculty
        req_in = ChangeRequestCreate(
            resource_type="student_profile",
            resource_id=student.id if student else None,
            action="update",
            payload=updates.model_dump(exclude_unset=True)
        )
        cr = await approvals_service.create_request(db, req_in, current_user.id)
        return schema.StudentUpdateResultResponse(
            change_request_id=str(cr.id),
            status="pending_approval",
            message="Change request submitted for HOD approval"
        )

@router.patch("/{id}", response_model=schema.StudentUpdateResultResponse)
async def update_student_by_id(
    id: UUID,
    updates: schema.StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    st_res = await db.execute(select(Student).where(Student.id == id))
    student = st_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    is_hod = current_user.email in ["admin@aiml.hub", "hod@aiml.hub", "720anant@gmail.com"]
    is_self = student.user_id == current_user.id

    if is_self or is_hod:
        # Apply directly
        update_data = updates.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            if hasattr(student, k):
                setattr(student, k, v)
        await db.commit()
        profile = await service.get_student_profile(db, student.user_id)
        return schema.StudentUpdateResultResponse(
            profile=profile,
            status="updated",
            message="Student profile updated successfully"
        )
    else:
        # Faculty -> route through change_requests
        req_in = ChangeRequestCreate(
            resource_type="student_profile",
            resource_id=student.id,
            action="update",
            payload=updates.model_dump(exclude_unset=True)
        )
        cr = await approvals_service.create_request(db, req_in, current_user.id)
        return schema.StudentUpdateResultResponse(
            change_request_id=str(cr.id),
            status="pending_approval",
            message="Change request submitted for HOD approval"
        )

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

@router.post("/me/resume/confirm")
async def confirm_resume(
    req: schema.ConfirmResumeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    return await service.confirm_resume(db, current_user.id, req)
