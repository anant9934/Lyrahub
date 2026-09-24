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
from app.services.storage import get_storage
import pdfplumber
import io
import re
async def presign_resume(db: AsyncSession, user_id: UUID, req: PresignResumeRequest):
    if req.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    if req.content_type not in ["application/pdf"]:
        raise HTTPException(status_code=415, detail="Invalid content type. Only PDF is allowed.")
    
    file_id = uuid4()
    # key format: {student_id}/{file_id}.pdf
    student = await get_student_by_user_id(db, user_id)
    key = f"{student.id}/{file_id}.pdf"
    
    storage = get_storage()
    upload_url = await storage.generate_upload_url(key, req.content_type)
    
    return {"upload_url": upload_url, "file_id": str(file_id), "key": key}

async def confirm_resume(db: AsyncSession, user_id: UUID, req: ConfirmResumeRequest):
    student = await get_student_by_user_id(db, user_id)
    storage = get_storage()
    
    if not await storage.file_exists(req.key):
        raise HTTPException(status_code=404, detail="File not found in storage")
        
    # read bytes via storage.get_file_bytes(key)
    file_bytes = await storage.get_file_bytes(req.key)
    
    # Extract text with pdfplumber (basic keyword parsing mock for now)
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to parse PDF")
        
    # 1. Load skill names + aliases from DB
    skills_result = await db.execute(select(Skill.id, Skill.name, Skill.aliases))
    skill_lookup = {}
    skill_id_map = {}
    for sid, name, aliases in skills_result:
        skill_lookup[name.lower()] = name
        skill_id_map[name] = sid
        for alias in (aliases or []):
            skill_lookup[alias.lower()] = name
            
    # 2. Match against resume text
    found = set()
    text_lower = text.lower()
    for keyword, canonical in skill_lookup.items():
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found.add(canonical)
            
    # 3. Extract projects via regex
    projects = []
    project_matches = re.finditer(r'(?i)\b(project[s]?[:\-]?)\s*\n?(.{10,200})', text)
    for match in project_matches:
        projects.append({"title": match.group(2).strip()[:50], "description": match.group(2).strip()})

    # 4. Extract certifications via regex
    certs = []
    cert_matches = re.finditer(r'(?i)\b(certifi(?:ed|cate|cation)[s]?[:\-]?)\s*\n?(.{10,100})', text)
    for match in cert_matches:
        certs.append({"title": match.group(2).strip()[:50]})

    existing = await db.execute(select(StudentResume).where(StudentResume.file_hash == req.content_hash))
    if existing.scalar_one_or_none():
        pass
        
    extracted_skills = sorted(list(found))
    resume = StudentResume(
        id=req.file_id,
        student_id=student.id,
        file_url=await storage.get_download_url(req.key),
        file_hash=req.content_hash,
        parse_status="completed",
        parsed_skills=extracted_skills,
        parsed_projects=projects,
        parsed_certifications=certs,
        parsed_at=datetime.utcnow()
    )
    db.add(resume)
    
    # 6. Populate student_skills mapping table
    # Delete existing parsed skills if re-uploading? Or just add. The prompt says "ON CONFLICT DO NOTHING (upsert)".
    # SQLAlchemy ORM doesn't do upsert easily without core inserts. We can do simple check.
    for s_name in extracted_skills:
        s_id = skill_id_map[s_name]
        # check if already exists
        ext_res = await db.execute(
            select(StudentSkill).where(
                StudentSkill.student_id == student.id, 
                StudentSkill.skill_id == s_id
            )
        )
        if not ext_res.scalar_one_or_none():
            ss = StudentSkill(
                student_id=student.id,
                skill_id=s_id,
                proficiency="intermediate",
                source="resume_parsed"
            )
            db.add(ss)

    await db.commit()
    
    return {
        "message": "Resume uploaded successfully", 
        "resume_id": str(req.file_id),
        "parsed_skills": extracted_skills
    }
