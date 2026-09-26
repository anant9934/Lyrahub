import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, delete, and_, or_
from fastapi import HTTPException, status

from app.models import (
    ChangeRequest,
    ApprovalNotification,
    Student,
    User,
    AuditLog
)
from app.modules.approvals.schema import (
    ChangeRequestCreate,
    ChangeRequestReject,
    ChangeRequestResponse
)

async def get_student_snapshot(db: AsyncSession, student_id: uuid.UUID) -> Dict[str, Any]:
    stmt = select(Student).where(Student.id == student_id)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        return {}
    return {
        "id": str(st.id),
        "reg_no": st.reg_no,
        "cgpa": float(st.cgpa) if st.cgpa is not None else None,
        "bio": st.bio,
        "github_url": st.github_url,
        "linkedin_url": st.linkedin_url,
        "portfolio_url": st.portfolio_url,
        "skills": st.skills,
        "department": getattr(st, "department", "AI/ML"),
        "section": st.section,
        "batch": st.batch,
        "placement_status": st.placement_status
    }


async def create_request(
    db: AsyncSession,
    req_in: ChangeRequestCreate,
    requester_id: uuid.UUID
) -> ChangeRequest:
    current_snapshot = {}
    if req_in.resource_type == "student_profile" and req_in.resource_id:
        current_snapshot = await get_student_snapshot(db, req_in.resource_id)

    change_req = ChangeRequest(
        id=uuid.uuid4(),
        requester_id=requester_id,
        resource_type=req_in.resource_type,
        resource_id=req_in.resource_id,
        action=req_in.action,
        payload=req_in.payload,
        current_state=current_snapshot,
        status="pending"
    )
    db.add(change_req)

    # Notify HOD / Admins
    hod_stmt = select(User).where(User.email.in_(["admin@aiml.hub", "hod@aiml.hub"]))
    hod_res = await db.execute(hod_stmt)
    for hod in hod_res.scalars().all():
        notif = ApprovalNotification(
            id=uuid.uuid4(),
            change_request_id=change_req.id,
            recipient_id=hod.id,
            channel="in_app",
            sent_at=datetime.now(timezone.utc)
        )
        db.add(notif)

    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=requester_id,
        action="SUBMIT_CHANGE_REQUEST",
        resource_type="change_requests",
        resource_id=str(change_req.id),
        payload={"resource_type": req_in.resource_type, "action": req_in.action}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(change_req)
    return change_req

async def list_requests(
    db: AsyncSession,
    user: User,
    is_hod_or_admin: bool,
    status_filter: Optional[str] = None,
    resource_type: Optional[str] = None,
    requester_id: Optional[uuid.UUID] = None
) -> List[ChangeRequestResponse]:
    query = (
        select(ChangeRequest, User.email)
        .outerjoin(User, ChangeRequest.requester_id == User.id)
    )

    if not is_hod_or_admin:
        query = query.where(ChangeRequest.requester_id == user.id)
    elif requester_id:
        query = query.where(ChangeRequest.requester_id == requester_id)

    if status_filter and status_filter != "all":
        query = query.where(ChangeRequest.status == status_filter)
    if resource_type and resource_type != "all":
        query = query.where(ChangeRequest.resource_type == resource_type)

    query = query.order_by(ChangeRequest.created_at.desc())
    res = await db.execute(query)

    items = []
    for cr, req_email in res.all():
        items.append(
            ChangeRequestResponse(
                id=cr.id,
                requester_id=cr.requester_id,
                requester_email=req_email,
                resource_type=cr.resource_type,
                resource_id=cr.resource_id,
                action=cr.action,
                payload=cr.payload,
                current_state=cr.current_state,
                status=cr.status,
                reviewer_id=cr.reviewer_id,
                reviewer_email=None,
                reviewer_comment=cr.reviewer_comment,
                reviewed_at=cr.reviewed_at,
                created_at=cr.created_at,
                updated_at=cr.updated_at
            )
        )
    return items

async def get_request_by_id(
    db: AsyncSession,
    req_id: uuid.UUID,
    user: User,
    is_hod_or_admin: bool
) -> ChangeRequestResponse:
    stmt = (
        select(ChangeRequest, User.email)
        .outerjoin(User, ChangeRequest.requester_id == User.id)
        .where(ChangeRequest.id == req_id)
    )
    res = await db.execute(stmt)
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Change request not found")

    cr, req_email = row
    if not is_hod_or_admin and cr.requester_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")

    rev_email = None
    if cr.reviewer_id:
        rev_stmt = select(User.email).where(User.id == cr.reviewer_id)
        rev_res = await db.execute(rev_stmt)
        rev_email = rev_res.scalar_one_or_none()

    return ChangeRequestResponse(
        id=cr.id,
        requester_id=cr.requester_id,
        requester_email=req_email,
        resource_type=cr.resource_type,
        resource_id=cr.resource_id,
        action=cr.action,
        payload=cr.payload,
        current_state=cr.current_state,
        status=cr.status,
        reviewer_id=cr.reviewer_id,
        reviewer_email=rev_email,
        reviewer_comment=cr.reviewer_comment,
        reviewed_at=cr.reviewed_at,
        created_at=cr.created_at,
        updated_at=cr.updated_at
    )

async def approve_request(
    db: AsyncSession,
    req_id: uuid.UUID,
    reviewer_id: uuid.UUID
) -> ChangeRequest:
    stmt = select(ChangeRequest).where(ChangeRequest.id == req_id)
    res = await db.execute(stmt)
    cr = res.scalar_one_or_none()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    if cr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot approve request with status '{cr.status}'")
    if cr.requester_id == reviewer_id:
        raise HTTPException(status_code=400, detail="Cannot approve your own request")

    # Apply the change
    if cr.resource_type == "student_profile" and cr.resource_id:
        st_stmt = select(Student).where(Student.id == cr.resource_id)
        st_res = await db.execute(st_stmt)
        student = st_res.scalar_one_or_none()
        if student:
            for k, v in cr.payload.items():
                if hasattr(student, k):
                    setattr(student, k, v)

    now = datetime.now(timezone.utc)
    cr.status = "approved"
    cr.reviewer_id = reviewer_id
    cr.reviewed_at = now

    # Notify requester
    notif = ApprovalNotification(
        id=uuid.uuid4(),
        change_request_id=cr.id,
        recipient_id=cr.requester_id,
        channel="in_app",
        sent_at=now
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=reviewer_id,
        action="APPROVE_CHANGE_REQUEST",
        resource_type="change_requests",
        resource_id=str(cr.id),
        payload={"status": "approved"}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(cr)
    return cr

async def reject_request(
    db: AsyncSession,
    req_id: uuid.UUID,
    comment: str,
    reviewer_id: uuid.UUID
) -> ChangeRequest:
    stmt = select(ChangeRequest).where(ChangeRequest.id == req_id)
    res = await db.execute(stmt)
    cr = res.scalar_one_or_none()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    if cr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot reject request with status '{cr.status}'")

    now = datetime.now(timezone.utc)
    cr.status = "rejected"
    cr.reviewer_id = reviewer_id
    cr.reviewed_at = now
    cr.reviewer_comment = comment

    # Notify requester
    notif = ApprovalNotification(
        id=uuid.uuid4(),
        change_request_id=cr.id,
        recipient_id=cr.requester_id,
        channel="in_app",
        sent_at=now
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=reviewer_id,
        action="REJECT_CHANGE_REQUEST",
        resource_type="change_requests",
        resource_id=str(cr.id),
        payload={"status": "rejected", "comment": comment}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(cr)
    return cr

async def withdraw_request(
    db: AsyncSession,
    req_id: uuid.UUID,
    requester_id: uuid.UUID
) -> ChangeRequest:
    stmt = select(ChangeRequest).where(ChangeRequest.id == req_id)
    res = await db.execute(stmt)
    cr = res.scalar_one_or_none()
    if not cr:
        raise HTTPException(status_code=404, detail="Change request not found")
    if cr.requester_id != requester_id:
        raise HTTPException(status_code=403, detail="Cannot withdraw request submitted by another user")
    if cr.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be withdrawn")

    cr.status = "withdrawn"
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=requester_id,
        action="WITHDRAW_CHANGE_REQUEST",
        resource_type="change_requests",
        resource_id=str(cr.id),
        payload={"status": "withdrawn"}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(cr)
    return cr

async def get_pending_count(
    db: AsyncSession,
    user: User,
    is_hod_or_admin: bool
) -> int:
    query = select(func.count(ChangeRequest.id)).where(ChangeRequest.status == "pending")
    if not is_hod_or_admin:
        query = query.where(ChangeRequest.requester_id == user.id)
    res = await db.execute(query)
    return res.scalar() or 0

async def get_history(
    db: AsyncSession,
    user: User,
    is_hod_or_admin: bool
) -> List[ChangeRequestResponse]:
    query = (
        select(ChangeRequest, User.email)
        .outerjoin(User, ChangeRequest.requester_id == User.id)
        .where(ChangeRequest.status.in_(["approved", "rejected", "withdrawn"]))
    )
    if not is_hod_or_admin:
        query = query.where(ChangeRequest.requester_id == user.id)

    query = query.order_by(ChangeRequest.reviewed_at.desc().nullslast())
    res = await db.execute(query)

    items = []
    for cr, req_email in res.all():
        items.append(
            ChangeRequestResponse(
                id=cr.id,
                requester_id=cr.requester_id,
                requester_email=req_email,
                resource_type=cr.resource_type,
                resource_id=cr.resource_id,
                action=cr.action,
                payload=cr.payload,
                current_state=cr.current_state,
                status=cr.status,
                reviewer_id=cr.reviewer_id,
                reviewer_email=None,
                reviewer_comment=cr.reviewer_comment,
                reviewed_at=cr.reviewed_at,
                created_at=cr.created_at,
                updated_at=cr.updated_at
            )
        )
    return items
