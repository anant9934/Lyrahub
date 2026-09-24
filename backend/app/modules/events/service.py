import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from fastapi import HTTPException
from app.models import Event, EventRegistration, EventFeedback, Student, AuditLog
from .schema import EventCreate, EventUpdate, EventFeedbackCreate
from typing import Optional, List
from datetime import datetime, timezone

def generate_slug(title: str, existing_slugs: List[str]) -> str:
    base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    if base_slug not in existing_slugs:
        return base_slug
    counter = 2
    while f"{base_slug}-{counter}" in existing_slugs:
        counter += 1
    return f"{base_slug}-{counter}"

async def get_events(
    db: AsyncSession,
    status: Optional[str] = "published",
    event_type: Optional[str] = None,
    category: Optional[str] = None,
    mode: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    force_published: bool = True
):
    query = select(Event).where(Event.deleted_at == None)
    
    if force_published:
        query = query.where(Event.status == "published")
    elif status:
        query = query.where(Event.status == status)
        
    if event_type:
        query = query.where(Event.event_type == event_type)
    if category:
        query = query.where(Event.category == category)
    if mode:
        query = query.where(Event.mode == mode)
    if search:
        query = query.where(Event.title.ilike(f"%{search}%"))
        
    total_res = await db.scalar(select(func.count()).select_from(query.subquery()))
    
    query = query.order_by(Event.start_datetime.desc()).offset((page - 1) * page_size).limit(page_size)
    events_res = await db.execute(query)
    events = events_res.scalars().all()
    
    # fetch registration counts
    result_items = []
    for e in events:
        reg_count = await db.scalar(select(func.count()).where(EventRegistration.event_id == e.id))
        setattr(e, "registration_count", reg_count or 0)
        result_items.append(e)

    return result_items, total_res

async def get_event_by_id_or_slug(db: AsyncSession, id_or_slug: str):
    query = select(Event).where(Event.deleted_at == None)
    try:
        from uuid import UUID
        uuid_obj = UUID(id_or_slug)
        query = query.where(Event.id == uuid_obj)
    except ValueError:
        query = query.where(Event.slug == id_or_slug)
        
    res = await db.execute(query)
    event = res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    reg_count = await db.scalar(select(func.count()).where(EventRegistration.event_id == event.id))
    setattr(event, "registration_count", reg_count or 0)
    return event

async def create_event(db: AsyncSession, data: EventCreate, organizer_id):
    # check existing slugs
    base_slug = re.sub(r'[^a-z0-9]+', '-', data.title.lower()).strip('-')
    res = await db.execute(select(Event.slug).where(Event.slug.like(f"{base_slug}%")))
    existing_slugs = res.scalars().all()
    
    slug = generate_slug(data.title, existing_slugs)
    
    event = Event(**data.model_dump(), slug=slug, organizer_id=organizer_id, status="draft")
    db.add(event)
    
    db.add(AuditLog(actor_id=organizer_id, action="create_event", resource_type="event", payload={"title": event.title}))
    
    await db.commit()
    await db.refresh(event)
    setattr(event, "registration_count", 0)
    return event

async def update_event(db: AsyncSession, event_id, data: EventUpdate, user):
    event = await get_event_by_id_or_slug(db, str(event_id))
    
    if str(event.organizer_id) != str(user.id) and user.role not in ["hod", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    update_data = data.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] != event.title:
        base_slug = re.sub(r'[^a-z0-9]+', '-', update_data["title"].lower()).strip('-')
        res = await db.execute(select(Event.slug).where(Event.slug.like(f"{base_slug}%")))
        slug = generate_slug(update_data["title"], res.scalars().all())
        update_data["slug"] = slug
        
    for k, v in update_data.items():
        setattr(event, k, v)
        
    db.add(AuditLog(actor_id=user.id, action="update_event", resource_type="event", payload={"event_id": str(event.id)}))
    await db.commit()
    await db.refresh(event)
    return event

async def register_student(db: AsyncSession, event_id, user):
    event = await get_event_by_id_or_slug(db, str(event_id))
    if event.status != "published":
        raise HTTPException(status_code=403, detail="Event is not published")
        
    now = datetime.now(timezone.utc)
    
    if event.registration_deadline:
        deadline = event.registration_deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if now > deadline:
            raise HTTPException(status_code=400, detail="Registration deadline has passed")
            
    res = await db.execute(select(Student).where(Student.user_id == user.id))
    student = res.scalars().first()
    if not student:
        raise HTTPException(status_code=403, detail="Only students can register")
        
    if event.capacity:
        count = await db.scalar(select(func.count()).where(EventRegistration.event_id == event.id))
        if count >= event.capacity:
            raise HTTPException(status_code=409, detail="Event capacity reached")
            
    existing = await db.scalar(select(EventRegistration).where(
        EventRegistration.event_id == event.id,
        EventRegistration.student_id == student.id
    ))
    if existing:
        raise HTTPException(status_code=409, detail="Already registered")
        
    reg = EventRegistration(event_id=event.id, student_id=student.id)
    db.add(reg)
    db.add(AuditLog(actor_id=user.id, action="event_register", resource_type="event_registration", payload={"event_id": str(event.id)}))
    await db.commit()
    return {"message": "Registered successfully"}
