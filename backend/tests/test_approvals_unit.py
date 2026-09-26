import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from app.modules.approvals.service import (
    create_request,
    list_requests,
    get_request_by_id,
    approve_request,
    reject_request,
    withdraw_request,
    get_pending_count,
    get_history
)
from app.modules.approvals import schema
from app.models import ChangeRequest, ApprovalNotification, Student, User

def test_approvals_schemas():
    req = schema.ChangeRequestCreate(
        resource_type="student_profile",
        resource_id=uuid4(),
        action="update",
        payload={"cgpa": 9.4}
    )
    assert req.resource_type == "student_profile"
    assert req.payload["cgpa"] == 9.4

    reject_req = schema.ChangeRequestReject(
        comment="Inaccurate transcript documentation"
    )
    assert reject_req.comment == "Inaccurate transcript documentation"

@pytest.mark.asyncio
async def test_submit_change_request():
    db = AsyncMock()
    faculty_id = uuid4()
    student_id = uuid4()
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    student = Student(id=student_id, cgpa=8, reg_no="RA2111003010001")
    # Student query -> HODs query
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[hod_user]))))
    ]

    req_data = schema.ChangeRequestCreate(
        resource_type="student_profile",
        resource_id=student_id,
        action="update",
        payload={"cgpa": 9.2}
    )

    cr = await create_request(db, req_data, faculty_id)
    assert cr.requester_id == faculty_id
    assert cr.status == "pending"
    assert cr.current_state["cgpa"] == 8.0
    assert db.add.called
    assert db.commit.called

@pytest.mark.asyncio
async def test_approve_change_request():
    db = AsyncMock()
    faculty_id = uuid4()
    hod_id = uuid4()
    student_id = uuid4()
    cr_id = uuid4()

    student = Student(id=student_id, cgpa=8)
    cr = ChangeRequest(
        id=cr_id,
        requester_id=faculty_id,
        resource_type="student_profile",
        resource_id=student_id,
        action="update",
        payload={"cgpa": 9.5},
        status="pending"
    )

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=cr)), # CR lookup
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)) # Student lookup
    ]

    approved = await approve_request(db, cr_id, hod_id)
    assert approved.status == "approved"
    assert approved.reviewer_id == hod_id
    assert student.cgpa == 9.5
    assert db.commit.called

@pytest.mark.asyncio
async def test_cannot_approve_own_request():
    db = AsyncMock()
    faculty_id = uuid4()
    cr_id = uuid4()

    cr = ChangeRequest(
        id=cr_id,
        requester_id=faculty_id,
        resource_type="student_profile",
        status="pending"
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=cr))

    with pytest.raises(HTTPException) as exc:
        await approve_request(db, cr_id, faculty_id) # Same ID
    assert exc.value.status_code == 400
    assert "Cannot approve your own request" in str(exc.value.detail)


@pytest.mark.asyncio
async def test_reject_change_request():
    db = AsyncMock()
    faculty_id = uuid4()
    hod_id = uuid4()
    cr_id = uuid4()

    cr = ChangeRequest(
        id=cr_id,
        requester_id=faculty_id,
        resource_type="student_profile",
        status="pending"
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=cr))

    rejected = await reject_request(db, cr_id, "Transcript verification failed", hod_id)
    assert rejected.status == "rejected"
    assert rejected.reviewer_comment == "Transcript verification failed"
    assert rejected.reviewer_id == hod_id
    assert db.commit.called

@pytest.mark.asyncio
async def test_withdraw_change_request():
    db = AsyncMock()
    faculty_id = uuid4()
    cr_id = uuid4()

    cr = ChangeRequest(
        id=cr_id,
        requester_id=faculty_id,
        status="pending"
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=cr))

    withdrawn = await withdraw_request(db, cr_id, faculty_id)
    assert withdrawn.status == "withdrawn"
    assert db.commit.called

@pytest.mark.asyncio
async def test_get_pending_requests_count():
    db = AsyncMock()
    user = User(id=uuid4(), email="hod@aiml.hub")
    count_mock = MagicMock()
    count_mock.scalar.return_value = 4
    db.execute.return_value = count_mock

    count = await get_pending_count(db, user, is_hod_or_admin=True)
    assert count == 4
