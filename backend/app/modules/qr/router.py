import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import User, Student
from app.modules.qr.schema import (
    CreateAttendanceSessionRequest,
    AttendanceSessionResponse,
    MarkAttendanceRequest,
    MarkAttendanceResponse,
    SessionRecordsResponse,
)
from app.modules.qr import service

router = APIRouter()

@router.get("/student/{student_id}", response_class=Response)
async def get_student_qr(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns PNG image of permanent student QR code.
    If student_id == 'me', resolves current user's student profile.
    """
    target_id: uuid.UUID
    if student_id == "me":
        st_res = await db.execute(select(Student).where(Student.user_id == current_user.id))
        student = st_res.scalar_one_or_none()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        target_id = student.id
    else:
        try:
            target_id = uuid.UUID(student_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid student UUID")

    png_bytes = await service.get_student_qr_bytes(db, target_id)
    return Response(content=png_bytes, media_type="image/png")

async def _get_role(user: User) -> str:
    if user.email in ["admin@aiml.hub", "hod@aiml.hub"]:
        return "faculty"
    try:
        from app.core.rbac import get_enforcer
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["admin", "hod", "faculty", "student", "alumni"]:
                if r in roles:
                    return r
    except Exception:
        pass
    return "student"

async def _require_faculty_or_admin(user: User):
    role = await _get_role(user)
    if role not in ["faculty", "hod", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty and administrators can perform this action")
    return role

@router.post("/attendance/session", response_model=AttendanceSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance_session(
    body: CreateAttendanceSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Faculty / HOD creates an attendance session with QR."""
    await _require_faculty_or_admin(current_user)
    return await service.create_attendance_session(db, body, current_user.id)

@router.post("/attendance/mark", response_model=MarkAttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(
    body: MarkAttendanceRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Student marks attendance for a live session."""
    client_ip = request.client.host if request.client else None
    result = await service.mark_attendance(
        db=db,
        session_id=body.session_id,
        user_id=current_user.id,
        ip_address=client_ip
    )
    return result

@router.get("/attendance/session/{session_id}/records", response_model=SessionRecordsResponse)
async def get_session_records(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Faculty / Admin retrieves live marked students for a session."""
    await _require_faculty_or_admin(current_user)
    return await service.get_session_records(db, session_id)


@router.get("/event/{event_id}", response_class=Response)
async def get_event_qr(event_id: uuid.UUID):
    """Public QR code for event registration."""
    png_bytes = service.generate_event_qr_bytes(event_id)
    return Response(content=png_bytes, media_type="image/png")

@router.get("/feedback/{context}/{context_id}", response_class=Response)
async def get_feedback_qr(context: str, context_id: str):
    """Public QR code for event/course feedback."""
    png_bytes = service.generate_feedback_qr_bytes(context, context_id)
    return Response(content=png_bytes, media_type="image/png")
