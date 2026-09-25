from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from fastapi import HTTPException
from app.models import Achievement, Student, User, AuditLog
from .schema import AchievementCreate
from typing import Optional
from datetime import datetime, timezone

async def get_achievements(
    db: AsyncSession,
    person_type: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    force_verified: bool = True
):
    query = select(Achievement).where(Achievement.deleted_at == None)
    
    if force_verified:
        query = query.where(Achievement.is_verified == True)
        
    if person_type:
        query = query.where(Achievement.person_type == person_type)
    if category:
        query = query.where(Achievement.category == category)
    if level:
        query = query.where(Achievement.level == level)
    if search:
        query = query.where(Achievement.title.ilike(f"%{search}%"))
        
    total_res = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.order_by(Achievement.achieved_on.desc()).offset((page - 1) * page_size).limit(page_size)
    
    items = await db.execute(query)
    return items.scalars().all(), total_res

async def create_achievement(db: AsyncSession, data: AchievementCreate, current_user, role: str = "student"):
    is_verified = False
    person_id = data.person_id
    person_type = "student"
    
    if role in ["hod", "admin"]:
        is_verified = True
        if not person_id:
            raise HTTPException(status_code=400, detail="Must specify person_id")
        
        # Determine person type
        res = await db.execute(select(Student).where(Student.id == person_id))
        if not res.scalars().first():
            res = await db.execute(select(User).where(User.id == person_id))
            if not res.scalars().first():
                raise HTTPException(status_code=404, detail="Person not found")
            person_type = "faculty"
    elif role == "faculty":
        # Faculty submitting for a student
        if not person_id:
            person_id = current_user.id
            person_type = "faculty"
        else:
            person_type = "student"
    else: # Student
        # Student submitting for themselves
        res = await db.execute(select(Student).where(Student.user_id == current_user.id))
        student = res.scalars().first()
        if not student:
            raise HTTPException(status_code=403, detail="Not a valid student")
        person_id = student.id
        
    ach = Achievement(
        **data.model_dump(exclude={"person_id"}),
        person_id=person_id,
        person_type=person_type,
        is_verified=is_verified
    )
    if is_verified:
        ach.verified_by = current_user.id
        ach.verified_at = datetime.utcnow()
        
    db.add(ach)
    db.add(AuditLog(actor_id=current_user.id, action="create_achievement", resource_type="achievement", payload={"title": data.title}))
    await db.commit()
    await db.refresh(ach)
    return ach

async def verify_achievement(db: AsyncSession, ach_id: str, current_user):
    from uuid import UUID
    res = await db.execute(select(Achievement).where(Achievement.id == UUID(ach_id)))
    ach = res.scalars().first()
    if not ach:
        raise HTTPException(status_code=404, detail="Not found")
        
    ach.is_verified = True
    ach.verified_by = current_user.id
    ach.verified_at = datetime.utcnow()
    
    db.add(AuditLog(actor_id=current_user.id, action="verify_achievement", resource_type="achievement", payload={"id": str(ach.id)}))
    await db.commit()
    return ach
