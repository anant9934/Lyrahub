import io
import json
import base64
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import qrcode
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.models import (
    AttendanceSession,
    AttendanceRecord,
    Student,
    Course,
    User,
    AuditLog
)
from app.modules.qr.schema import (
    CreateAttendanceSessionRequest,
    AttendanceSessionResponse,
    AttendanceRecordResponse,
    SessionRecordsResponse
)

settings = get_settings()
QR_SECRET = getattr(settings, "QR_SECRET", settings.JWT_SECRET)

def generate_qr_png_bytes(data: str) -> bytes:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer)
    return buffer.getvalue()

def generate_student_qr_token(student_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "student_id": str(student_id),
        "type": "student_signup",
        "iat": now,
        "exp": now + timedelta(days=90)
    }
    return jwt.encode(payload, QR_SECRET, algorithm="HS256")

async def get_student_qr_bytes(db: AsyncSession, student_id: uuid.UUID) -> bytes:
    stmt = select(Student).where(Student.id == student_id)
    res = await db.execute(stmt)
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    token = generate_student_qr_token(student_id)
    qr_payload = json.dumps({
        "type": "student_signup",
        "token": token,
        "student_id": str(student_id),
        "reg_no": student.reg_no
    })
    return generate_qr_png_bytes(qr_payload)

async def create_attendance_session(
    db: AsyncSession,
    req_in: CreateAttendanceSessionRequest,
    user_id: uuid.UUID
) -> AttendanceSessionResponse:
    course_name = None
    if req_in.course_id:
        c_stmt = select(Course.name).where(Course.id == req_in.course_id)
        c_res = await db.execute(c_stmt)
        course_name = c_res.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=req_in.duration_minutes)

    session = AttendanceSession(
        id=uuid.uuid4(),
        course_id=req_in.course_id,
        section=req_in.section or "A",
        created_by=user_id,
        created_at=now,
        expires_at=expires_at,
        is_active=True
    )
    db.add(session)

    qr_payload = json.dumps({
        "type": "attendance",
        "session_id": str(session.id),
        "course_id": str(req_in.course_id) if req_in.course_id else None,
        "section": req_in.section
    })
    qr_png = generate_qr_png_bytes(qr_payload)
    qr_base64 = f"data:image/png;base64,{base64.b64encode(qr_png).decode('utf-8')}"

    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="CREATE_ATTENDANCE_SESSION",
        resource_type="attendance_sessions",
        resource_id=str(session.id),
        payload={"course_id": str(req_in.course_id), "duration": req_in.duration_minutes}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(session)

    return AttendanceSessionResponse(
        id=session.id,
        course_id=session.course_id,
        course_name=course_name,
        section=session.section,
        qr_data=qr_payload,
        qr_image_base64=qr_base64,
        expires_at=session.expires_at,
        is_active=session.is_active,
        created_at=session.created_at
    )

async def mark_attendance(
    db: AsyncSession,
    session_id: uuid.UUID,
    user_id: uuid.UUID,
    ip_address: Optional[str] = None
) -> Dict[str, Any]:
    stmt = select(AttendanceSession).where(AttendanceSession.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Attendance session not found")

    now = datetime.now(timezone.utc)
    if not session.is_active or (session.expires_at and now > session.expires_at):
        raise HTTPException(status_code=400, detail="Attendance session has expired or is inactive")

    # Get student
    st_stmt = select(Student).where(Student.user_id == user_id)
    st_res = await db.execute(st_stmt)
    student = st_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Student profile required to mark attendance")

    # Check already marked
    rec_stmt = select(AttendanceRecord).where(
        AttendanceRecord.session_id == session_id,
        AttendanceRecord.student_id == student.id
    )
    rec_res = await db.execute(rec_stmt)
    if rec_res.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Attendance has already been marked for this session")

    record = AttendanceRecord(
        id=uuid.uuid4(),
        session_id=session_id,
        student_id=student.id,
        marked_at=now,
        ip_address=ip_address
    )
    db.add(record)

    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="MARK_ATTENDANCE",
        resource_type="attendance_records",
        resource_id=str(record.id),
        payload={"session_id": str(session_id), "student_id": str(student.id)}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(record)

    return {
        "message": "Attendance marked successfully",
        "session_id": session_id,
        "student_id": student.id,
        "marked_at": record.marked_at
    }

async def get_session_records(db: AsyncSession, session_id: uuid.UUID) -> SessionRecordsResponse:
    sess_stmt = select(AttendanceSession).where(AttendanceSession.id == session_id)
    sess_res = await db.execute(sess_stmt)
    session = sess_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Attendance session not found")

    stmt = (
        select(AttendanceRecord, Student, User)
        .join(Student, AttendanceRecord.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(AttendanceRecord.session_id == session_id)
        .order_by(AttendanceRecord.marked_at.desc())
    )
    res = await db.execute(stmt)

    records = []
    for rec, stud, usr in res.all():
        records.append(
            AttendanceRecordResponse(
                id=rec.id,
                student_id=rec.student_id,
                student_email=usr.email,
                student_reg_no=stud.reg_no,
                marked_at=rec.marked_at,
                ip_address=rec.ip_address
            )
        )

    return SessionRecordsResponse(
        session_id=session.id,
        course_id=session.course_id,
        section=session.section,
        is_active=session.is_active,
        expires_at=session.expires_at,
        total_marked=len(records),
        records=records
    )

def generate_event_qr_bytes(event_id: uuid.UUID) -> bytes:
    qr_payload = json.dumps({
        "type": "event_register",
        "event_id": str(event_id)
    })
    return generate_qr_png_bytes(qr_payload)

def generate_feedback_qr_bytes(context: str, context_id: str) -> bytes:
    qr_payload = json.dumps({
        "type": "feedback",
        "context": context,
        "context_id": context_id
    })
    return generate_qr_png_bytes(qr_payload)
