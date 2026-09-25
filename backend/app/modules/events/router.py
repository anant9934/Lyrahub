from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models import User, Event, AuditLog, EventRegistration, Student, EventFeedback
from . import schema
from . import service
from sqlalchemy import select
from app.core.rbac import get_enforcer

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

router = APIRouter(tags=["events"])

@router.get("", response_model=schema.EventListResponse)
async def list_events(
    status_filter: Optional[str] = Query(None, alias="status"),
    event_type: Optional[str] = None,
    category: Optional[str] = None,
    mode: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    force_published = True
    if current_user:
        role = await _get_role(current_user)
        if role in ["faculty", "hod", "admin"]:
            force_published = False
        
    items, total = await service.get_events(
        db, status_filter, event_type, category, mode, search, page, page_size, force_published
    )
    
    return schema.EventListResponse(items=items, total=total, page=page, page_size=page_size)

@router.get("/{id_or_slug}", response_model=schema.EventResponse)
async def get_event(id_or_slug: str, db: AsyncSession = Depends(get_db)):
    return await service.get_event_by_id_or_slug(db, id_or_slug)

@router.post("", response_model=schema.EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: schema.EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    if role not in ["faculty", "hod", "admin"]:
        raise HTTPException(status_code=403, detail="Only faculty or admins can create events")
    return await service.create_event(db, data, current_user.id)

@router.post("/{event_id}/publish")
async def publish_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await service.get_event_by_id_or_slug(db, str(event_id))
    role = await _get_role(current_user)
    if str(event.organizer_id) != str(current_user.id) and role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    event.status = "published"
    db.add(AuditLog(actor_id=current_user.id, action="publish_event", resource_type="event", payload={"event_id": str(event.id)}))
    await db.commit()
    return {"message": "Event published"}

@router.post("/{event_id}/register", status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await service.register_student(db, event_id, current_user)

@router.post("/{event_id}/attendance/{student_id}")
async def mark_attendance(
    event_id: UUID,
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await service.get_event_by_id_or_slug(db, str(event_id))
    role = await _get_role(current_user)
    if str(event.organizer_id) != str(current_user.id) and role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    res = await db.execute(select(EventRegistration).where(
        EventRegistration.event_id == event.id,
        EventRegistration.student_id == student_id
    ))
    reg = res.scalars().first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    reg.attended = True
    reg.attended_at = datetime.utcnow()
    await db.commit()
    return {"message": "Attendance marked"}

@router.post("/{event_id}/feedback", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    event_id: UUID,
    data: schema.EventFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await service.get_event_by_id_or_slug(db, str(event_id))
    if event.end_datetime:
        from datetime import timezone
        now = datetime.now(timezone.utc)
        end = event.end_datetime
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if now < end:
            raise HTTPException(status_code=400, detail="Event has not ended yet")
            
    res = await db.execute(select(Student).where(Student.user_id == current_user.id))
    student = res.scalars().first()
    if not student:
        raise HTTPException(status_code=403, detail="Only students can submit feedback")
        
    res = await db.execute(select(EventRegistration).where(
        EventRegistration.event_id == event.id,
        EventRegistration.student_id == student.id
    ))
    reg = res.scalars().first()
    if not reg or not reg.attended:
        raise HTTPException(status_code=403, detail="Must have attended the event")
        
    existing = await db.scalar(select(EventFeedback).where(
        EventFeedback.event_id == event.id,
        EventFeedback.student_id == student.id
    ))
    if existing:
        raise HTTPException(status_code=409, detail="Feedback already submitted")
        
    fb = EventFeedback(event_id=event.id, student_id=student.id, rating=data.rating, comments=data.comments)
    db.add(fb)
    await db.commit()
    return {"message": "Feedback submitted"}
