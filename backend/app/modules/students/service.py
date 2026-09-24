from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from uuid import UUID
from fastapi import HTTPException
from datetime import datetime

from app.models import Student, StudentHistory, StudentResume, StudentSkill, Skill
from .schema import StudentProfileUpdateRequest, AddSkillRequest, PresignResumeRequest, ConfirmResumeRequest

async def get_student_by_user_id(db: AsyncSession, user_id: UUID) -> Student:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

async def get_student_profile(db: AsyncSession, user_id: UUID):
    student = await get_student_by_user_id(db, user_id)
    
    # Fetch skills separately due to JSONB or many-to-many depending on if we use StudentSkill
    result = await db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student.id)
    )
    student_skills = []
    for ss, skill in result.all():
        student_skills.append({
            "skill_id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "proficiency": ss.proficiency,
            "source": ss.source,
            "verified": bool(ss.verified_by)
        })
    
    # We serialize the student data and append skills
    profile = {c.name: getattr(student, c.name) for c in student.__table__.columns}
    profile["skills"] = student_skills
    return profile

async def update_student_profile(db: AsyncSession, user_id: UUID, updates: StudentProfileUpdateRequest, actor_id: UUID):
    student = await get_student_by_user_id(db, user_id)
    
    # Log history
    old_data = {c.name: getattr(student, c.name) for c in student.__table__.columns}
    # we should handle datetime serialization properly if jsonb, but SQLAlchemy handles it somewhat.
    # To be safe, we might just store a subset or rely on SQLAlchemy json serializer
    
    # Update fields
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
        
    student.updated_at = datetime.utcnow()
    
    history = StudentHistory(
        student_id=student.id,
        data=update_data, # store diff
        changed_by=actor_id
    )
    db.add(history)
    
    await db.commit()
    await db.refresh(student)
    return await get_student_profile(db, user_id)

async def add_student_skill(db: AsyncSession, user_id: UUID, req: AddSkillRequest):
    student = await get_student_by_user_id(db, user_id)
    
    # verify skill exists
    skill_res = await db.execute(select(Skill).where(Skill.id == req.skill_id))
    skill = skill_res.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    # check existing
    existing = await db.execute(
        select(StudentSkill)
        .where(StudentSkill.student_id == student.id, StudentSkill.skill_id == req.skill_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Skill already added")
        
    student_skill = StudentSkill(
        student_id=student.id,
        skill_id=skill.id,
        proficiency=req.proficiency,
        source="self_declared"
    )
    db.add(student_skill)
    await db.commit()
    return {"message": "Skill added successfully"}

async def remove_student_skill(db: AsyncSession, user_id: UUID, skill_id: UUID):
    student = await get_student_by_user_id(db, user_id)
    
    existing = await db.execute(
        select(StudentSkill)
        .where(StudentSkill.student_id == student.id, StudentSkill.skill_id == skill_id)
    )
    ss = existing.scalar_one_or_none()
    if not ss:
        raise HTTPException(status_code=404, detail="Student skill not found")
        
    await db.delete(ss)
    await db.commit()
    return {"message": "Skill removed successfully"}

from uuid import uuid4

async def presign_resume(db: AsyncSession, user_id: UUID, req: PresignResumeRequest):
    if req.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    if req.content_type not in ["application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid content type. Only PDF is allowed.")
    
    file_id = uuid4()
    r2_key = f"resumes/{user_id}/{file_id}_{req.filename}"
    # In a real scenario, use boto3 to generate presigned URL for R2 here
    upload_url = f"https://mock-r2-url.com/{r2_key}?signature=mock"
    return {"upload_url": upload_url, "file_id": str(file_id), "r2_key": r2_key}

async def confirm_resume(db: AsyncSession, user_id: UUID, file_id: UUID, r2_key: str, req: ConfirmResumeRequest):
    student = await get_student_by_user_id(db, user_id)
    
    existing = await db.execute(select(StudentResume).where(StudentResume.file_hash == req.content_hash))
    if existing.scalar_one_or_none():
        # Dedup logic: we could reuse the existing resume record but for now we just raise an error or link it
        # Actually, let's just proceed to insert with the same hash
        pass
        
    resume = StudentResume(
        id=file_id,
        student_id=student.id,
        file_url=f"https://cdn.lyrahub.com/{r2_key}",
        file_hash=req.content_hash,
        parse_status="pending"
    )
    db.add(resume)
    await db.commit()
    return {"message": "Resume uploaded successfully", "resume_id": str(file_id)}
