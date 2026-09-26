import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

from app.modules.qr.service import (
    generate_qr_png_bytes,
    generate_student_qr_token,
    get_student_qr_bytes,
    create_attendance_session,
    mark_attendance,
    get_session_records,
    generate_event_qr_bytes,
    generate_feedback_qr_bytes
)
from app.modules.qr import schema
from app.models import AttendanceSession, AttendanceRecord, Student, Course, User

def test_qr_schemas():
    req = schema.CreateAttendanceSessionRequest(
        course_id=uuid4(),
        section="AIML-A",
        duration_minutes=20
    )
    assert req.section == "AIML-A"
    assert req.duration_minutes == 20

    mark_req = schema.MarkAttendanceRequest(session_id=uuid4())
    assert mark_req.session_id is not None

def test_generate_qr_png_bytes():
    png_bytes = generate_qr_png_bytes("https://aiml.university.edu/test")
    assert isinstance(png_bytes, bytes)
    assert png_bytes.startswith(b"\x89PNG\r\n\x1a\n")

def test_generate_student_qr_token():
    student_id = uuid4()
    token = generate_student_qr_token(student_id)
    assert isinstance(token, str)
    assert len(token) > 20

@pytest.mark.asyncio
async def test_get_student_qr_bytes():
    db = AsyncMock()
    student_id = uuid4()
    student = Student(id=student_id, reg_no="RA2111003010001")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=student))

    png = await get_student_qr_bytes(db, student_id)
    assert isinstance(png, bytes)
    assert png.startswith(b"\x89PNG\r\n\x1a\n")

@pytest.mark.asyncio
async def test_create_attendance_session():
    db = AsyncMock()
    user_id = uuid4()
    course_id = uuid4()

    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value="Deep Learning 101"))

    req = schema.CreateAttendanceSessionRequest(
        course_id=course_id,
        section="B",
        duration_minutes=30
    )

    session_res = await create_attendance_session(db, req, user_id)
    assert session_res.section == "B"
    assert session_res.course_name == "Deep Learning 101"
    assert session_res.qr_image_base64.startswith("data:image/png;base64,")
    assert db.add.called
    assert db.commit.called

@pytest.mark.asyncio
async def test_mark_attendance_success():
    db = AsyncMock()
    user_id = uuid4()
    session_id = uuid4()
    student_id = uuid4()

    now = datetime.now(timezone.utc)
    session = AttendanceSession(
        id=session_id,
        is_active=True,
        expires_at=now + timedelta(minutes=15)
    )
    student = Student(id=student_id, user_id=user_id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=session)), # session lookup
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)), # student lookup
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))    # duplicate check
    ]

    res = await mark_attendance(db, session_id, user_id, ip_address="192.168.1.50")
    assert res["session_id"] == session_id
    assert res["student_id"] == student_id
    assert db.commit.called

@pytest.mark.asyncio
async def test_mark_attendance_duplicate_conflict():
    db = AsyncMock()
    user_id = uuid4()
    session_id = uuid4()
    student_id = uuid4()

    now = datetime.now(timezone.utc)
    session = AttendanceSession(id=session_id, is_active=True, expires_at=now + timedelta(minutes=15))
    student = Student(id=student_id, user_id=user_id)
    existing_record = AttendanceRecord(id=uuid4(), session_id=session_id, student_id=student_id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=session)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_record))
    ]

    with pytest.raises(HTTPException) as exc:
        await mark_attendance(db, session_id, user_id)
    assert exc.value.status_code == 409

@pytest.mark.asyncio
async def test_mark_attendance_expired_session():
    db = AsyncMock()
    user_id = uuid4()
    session_id = uuid4()

    # Expired 10 minutes ago
    past = datetime.now(timezone.utc) - timedelta(minutes=10)
    session = AttendanceSession(id=session_id, is_active=True, expires_at=past)

    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=session))

    with pytest.raises(HTTPException) as exc:
        await mark_attendance(db, session_id, user_id)
    assert exc.value.status_code == 400

@pytest.mark.asyncio
async def test_get_session_records():
    db = AsyncMock()
    session_id = uuid4()
    student_id = uuid4()

    session = AttendanceSession(id=session_id, is_active=True, section="A")
    rec = AttendanceRecord(id=uuid4(), session_id=session_id, student_id=student_id, marked_at=datetime.now(timezone.utc))
    stud = Student(id=student_id, reg_no="RA2111003010045")
    usr = User(id=uuid4(), email="student@university.edu")

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=session)),
        MagicMock(all=MagicMock(return_value=[(rec, stud, usr)]))
    ]

    res = await get_session_records(db, session_id)
    assert res.total_marked == 1
    assert res.records[0].student_email == "student@university.edu"

def test_event_and_feedback_qr():
    ev_qr = generate_event_qr_bytes(uuid4())
    assert ev_qr.startswith(b"\x89PNG\r\n\x1a\n")

    fb_qr = generate_feedback_qr_bytes("course", "deep-learning")
    assert fb_qr.startswith(b"\x89PNG\r\n\x1a\n")
