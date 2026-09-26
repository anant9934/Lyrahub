import re
import json
import os
import uuid
from datetime import datetime, date
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID
from fastapi import HTTPException, UploadFile
from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project, ProjectMember, ProjectDocument, Student, User, AuditLog
from app.core.redis import get_redis
from app.services.storage import get_storage
from . import schema


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-') or "project"


async def generate_unique_slug(db: AsyncSession, title: str) -> str:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1

    while True:
        res = await db.execute(
            select(Project.id).where(Project.slug == slug, Project.deleted_at.is_(None))
        )
        if not res.scalar_one_or_none():
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


async def get_projects(
    db: AsyncSession,
    domain: Optional[str] = None,
    status: Optional[str] = None,
    mentor_id: Optional[UUID] = None,
    search: Optional[str] = None,
    year: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    can_view_private: bool = False
) -> Tuple[List[schema.ProjectResponse], int]:
    query = select(Project).where(Project.deleted_at.is_(None))

    if not can_view_private:
        query = query.where(Project.is_public == True)

    if domain:
        query = query.where(Project.domain == domain)
    if status:
        query = query.where(Project.status == status)
    if mentor_id:
        query = query.where(Project.mentor_id == mentor_id)
    if year:
        query = query.where(func.extract('year', Project.start_date) == year)
    if search:
        s = f"%{search}%"
        query = query.where(
            or_(
                Project.title.ilike(s),
                Project.summary.ilike(s),
                Project.description.ilike(s)
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(Project.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    projects = result.scalars().all()

    items = await _batch_enrich_projects(db, projects)
    return items, total


async def _batch_enrich_projects(db: AsyncSession, projects: List[Project]) -> List[schema.ProjectResponse]:
    if not projects:
        return []
    project_ids = [p.id for p in projects]
    mentor_ids = list({p.mentor_id for p in projects if p.mentor_id})

    # Batch 1: Members with student reg_no in a single query
    mem_res = await db.execute(
        select(ProjectMember, Student.reg_no)
        .outerjoin(Student, ProjectMember.student_id == Student.id)
        .where(ProjectMember.project_id.in_(project_ids))
    )
    members_by_proj: dict[UUID, list] = {pid: [] for pid in project_ids}
    for pm, reg_no in mem_res.all():
        members_by_proj[pm.project_id].append(schema.ProjectMemberResponse(
            id=pm.id,
            project_id=pm.project_id,
            student_id=pm.student_id,
            role=pm.role or "contributor",
            joined_at=pm.joined_at,
            student_reg_no=reg_no
        ))

    # Batch 2: Documents in a single query
    doc_res = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id.in_(project_ids))
    )
    docs_by_proj: dict[UUID, list] = {pid: [] for pid in project_ids}
    for d in doc_res.scalars().all():
        docs_by_proj[d.project_id].append(schema.ProjectDocumentResponse.model_validate(d))

    # Batch 3: Mentors in a single query
    mentor_names = {}
    if mentor_ids:
        u_res = await db.execute(select(User.id, User.email).where(User.id.in_(mentor_ids)))
        mentor_names = {u[0]: u[1] for u in u_res.all()}

    items = []
    for project in projects:
        items.append(schema.ProjectResponse(
            id=project.id,
            title=project.title,
            slug=project.slug,
            summary=project.summary,
            description=project.description,
            tech_stack=project.tech_stack or [],
            domain=project.domain,
            status=project.status or "ongoing",
            github_url=project.github_url,
            demo_url=project.demo_url,
            paper_url=project.paper_url,
            mentor_id=project.mentor_id,
            external_mentor=project.external_mentor,
            start_date=project.start_date,
            end_date=project.end_date,
            outcomes=project.outcomes,
            awards=project.awards,
            revenue_generated=float(project.revenue_generated) if project.revenue_generated is not None else None,
            client_name=project.client_name,
            cover_image_url=project.cover_image_url,
            is_public=project.is_public if project.is_public is not None else True,
            created_by=project.created_by,
            created_at=project.created_at,
            updated_at=project.updated_at,
            mentor_name=mentor_names.get(project.mentor_id),
            members=members_by_proj.get(project.id, []),
            documents=docs_by_proj.get(project.id, [])
        ))
    return items


async def _enrich_project(db: AsyncSession, project: Project) -> schema.ProjectResponse:
    res = await _batch_enrich_projects(db, [project])
    return res[0]


async def get_project_by_id_or_slug(db: AsyncSession, id_or_slug: str) -> schema.ProjectResponse:
    project = None
    try:
        val_uuid = UUID(id_or_slug)
        res = await db.execute(
            select(Project).where(Project.id == val_uuid, Project.deleted_at.is_(None))
        )
        project = res.scalar_one_or_none()
    except ValueError:
        pass

    if not project:
        res = await db.execute(
            select(Project).where(Project.slug == id_or_slug, Project.deleted_at.is_(None))
        )
        project = res.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return await _enrich_project(db, project)


async def create_project(
    db: AsyncSession,
    data: schema.ProjectCreate,
    current_user: User,
    role: str
) -> schema.ProjectResponse:
    # Rule: If student, mentor_id is required
    if role == "student":
        if not data.mentor_id:
            raise HTTPException(status_code=400, detail="Mentor is required for student-created projects")

    # If mentor_id given, check existence
    if data.mentor_id:
        m_res = await db.execute(select(User).where(User.id == data.mentor_id, User.deleted_at.is_(None)))
        mentor_user = m_res.scalar_one_or_none()
        if not mentor_user:
            raise HTTPException(status_code=400, detail="Assigned mentor does not exist")

    slug = await generate_unique_slug(db, data.title)
    status_val = data.status or "ongoing"
    end_date_val = data.end_date
    if status_val == "completed" and not end_date_val:
        end_date_val = datetime.utcnow().date()

    now = datetime.utcnow()
    project = Project(
        id=uuid.uuid4(),
        title=data.title,
        slug=slug,
        summary=data.summary,
        description=data.description,
        tech_stack=data.tech_stack or [],
        domain=data.domain or "cv",
        status=status_val,
        github_url=data.github_url,
        demo_url=data.demo_url,
        paper_url=data.paper_url,
        mentor_id=data.mentor_id,
        external_mentor=data.external_mentor,
        start_date=data.start_date,
        end_date=end_date_val,
        outcomes=data.outcomes,
        awards=data.awards,
        revenue_generated=data.revenue_generated,
        client_name=data.client_name,
        cover_image_url=data.cover_image_url,
        is_public=data.is_public,
        created_by=current_user.id,
        created_at=now,
        updated_at=now
    )
    db.add(project)
    await db.flush()

    # Rule 2: A project must have at least one member (creator auto-added if student)
    if role == "student":
        s_res = await db.execute(select(Student).where(Student.user_id == current_user.id))
        student = s_res.scalar_one_or_none()
        if student:
            mem = ProjectMember(
                id=uuid.uuid4(),
                project_id=project.id,
                student_id=student.id,
                role="lead",
                joined_at=now
            )
            db.add(mem)

    # Audit log
    db.add(AuditLog(
        actor_id=current_user.id,
        action="create_project",
        resource_type="project",
        payload={"id": str(project.id), "title": project.title, "slug": project.slug}
    ))
    await db.commit()
    await db.refresh(project)

    return await _enrich_project(db, project)


async def update_project(
    db: AsyncSession,
    project_id: UUID,
    data: schema.ProjectUpdate,
    current_user: User,
    role: str
) -> schema.ProjectResponse:
    res = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at.is_(None)))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Auth check: creator, mentor, or HOD/Admin
    is_creator = (project.created_by == current_user.id)
    is_mentor = (project.mentor_id == current_user.id)
    if not (is_creator or is_mentor or role in ["hod", "admin"]):
        raise HTTPException(status_code=403, detail="Not authorized to edit this project")

    update_dict = data.model_dump(exclude_unset=True)
    if "title" in update_dict and update_dict["title"] != project.title:
        project.title = update_dict["title"]
        # re-slug if title changed? Spec says slug is auto-generated on creation

    if "status" in update_dict:
        project.status = update_dict["status"]
        if project.status == "completed" and not project.end_date and not update_dict.get("end_date"):
            project.end_date = datetime.utcnow().date()

    for k, v in update_dict.items():
        if k != "status":
            setattr(project, k, v)

    project.updated_at = datetime.utcnow()
    db.add(AuditLog(
        actor_id=current_user.id,
        action="update_project",
        resource_type="project",
        payload={"id": str(project.id), "changes": list(update_dict.keys())}
    ))
    await db.commit()
    await db.refresh(project)

    return await _enrich_project(db, project)


async def delete_project(
    db: AsyncSession,
    project_id: UUID,
    current_user: User,
    role: str
) -> None:
    res = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at.is_(None)))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_creator = (project.created_by == current_user.id)
    if not (is_creator or role in ["hod", "admin"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")

    project.deleted_at = datetime.utcnow()
    db.add(AuditLog(
        actor_id=current_user.id,
        action="delete_project",
        resource_type="project",
        payload={"id": str(project.id)}
    ))
    await db.commit()


async def add_member(
    db: AsyncSession,
    project_id: UUID,
    data: schema.ProjectMemberCreate,
    current_user: User,
    role: str
) -> schema.ProjectMemberResponse:
    res = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at.is_(None)))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_creator = (project.created_by == current_user.id)
    is_mentor = (project.mentor_id == current_user.id)
    if not (is_creator or is_mentor or role in ["hod", "admin"]):
        raise HTTPException(status_code=403, detail="Not authorized to manage project members")

    # Check if student exists
    s_res = await db.execute(select(Student).where(Student.id == data.student_id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Duplicate check
    m_res = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.student_id == data.student_id
        )
    )
    if m_res.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Student is already a member of this project")

    member = ProjectMember(
        id=uuid.uuid4(),
        project_id=project_id,
        student_id=data.student_id,
        role=data.role or "contributor",
        joined_at=datetime.utcnow()
    )
    db.add(member)
    db.add(AuditLog(
        actor_id=current_user.id,
        action="add_project_member",
        resource_type="project_member",
        payload={"project_id": str(project_id), "student_id": str(data.student_id), "role": data.role}
    ))
    await db.commit()
    await db.refresh(member)

    return schema.ProjectMemberResponse(
        id=member.id,
        project_id=member.project_id,
        student_id=member.student_id,
        role=member.role,
        joined_at=member.joined_at,
        student_reg_no=student.reg_no
    )


async def remove_member(
    db: AsyncSession,
    project_id: UUID,
    student_id: UUID,
    current_user: User,
    role: str
) -> None:
    res = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at.is_(None)))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_creator = (project.created_by == current_user.id)
    is_mentor = (project.mentor_id == current_user.id)
    if not (is_creator or is_mentor or role in ["hod", "admin"]):
        raise HTTPException(status_code=403, detail="Not authorized to remove project members")

    m_res = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.student_id == student_id
        )
    )
    member = m_res.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in project")

    await db.delete(member)
    db.add(AuditLog(
        actor_id=current_user.id,
        action="remove_project_member",
        resource_type="project_member",
        payload={"project_id": str(project_id), "student_id": str(student_id)}
    ))
    await db.commit()


async def add_document(
    db: AsyncSession,
    project_id: UUID,
    doc_type: str,
    file: UploadFile,
    current_user: User,
    role: str
) -> schema.ProjectDocumentResponse:
    res = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at.is_(None)))
    project = res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_creator = (project.created_by == current_user.id)
    is_mentor = (project.mentor_id == current_user.id)
    if not (is_creator or is_mentor or role in ["hod", "admin"]):
        raise HTTPException(status_code=403, detail="Not authorized to upload documents for this project")

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")

    storage = get_storage()
    file_ext = os.path.splitext(file.filename or "")[1] or ".pdf"
    key = f"projects/{project_id}/{uuid.uuid4()}{file_ext}"

    if hasattr(storage, "root_dir"):
        target_path = os.path.join(storage.root_dir, key)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(contents)
    file_url = await storage.get_download_url(key)

    doc = ProjectDocument(
        project_id=project_id,
        doc_type=doc_type,
        file_url=file_url,
        uploaded_by=current_user.id
    )
    db.add(doc)
    db.add(AuditLog(
        actor_id=current_user.id,
        action="upload_project_document",
        resource_type="project_document",
        payload={"project_id": str(project_id), "doc_type": doc_type, "file_url": file_url}
    ))
    await db.commit()
    await db.refresh(doc)

    return schema.ProjectDocumentResponse.model_validate(doc)


async def get_project_documents(db: AsyncSession, project_id: UUID) -> List[schema.ProjectDocumentResponse]:
    res = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id == project_id)
    )
    return [schema.ProjectDocumentResponse.model_validate(d) for d in res.scalars().all()]


async def get_my_projects(db: AsyncSession, current_user: User, role: str) -> List[schema.ProjectResponse]:
    project_ids = set()

    # Created by user
    c_res = await db.execute(
        select(Project.id).where(Project.created_by == current_user.id, Project.deleted_at.is_(None))
    )
    for (pid,) in c_res.all():
        project_ids.add(pid)

    # Mentored by user
    m_res = await db.execute(
        select(Project.id).where(Project.mentor_id == current_user.id, Project.deleted_at.is_(None))
    )
    for (pid,) in m_res.all():
        project_ids.add(pid)

    # Member of (if student)
    s_res = await db.execute(select(Student.id).where(Student.user_id == current_user.id))
    student_id = s_res.scalar_one_or_none()
    if student_id:
        mem_res = await db.execute(
            select(ProjectMember.project_id).where(ProjectMember.student_id == student_id)
        )
        for (pid,) in mem_res.all():
            project_ids.add(pid)

    if not project_ids:
        return []

    p_res = await db.execute(
        select(Project).where(Project.id.in_(project_ids), Project.deleted_at.is_(None)).order_by(Project.created_at.desc())
    )
    return await _batch_enrich_projects(db, p_res.scalars().all())


async def get_projects_by_mentor(db: AsyncSession, mentor_id: UUID) -> List[schema.ProjectResponse]:
    res = await db.execute(
        select(Project).where(Project.mentor_id == mentor_id, Project.deleted_at.is_(None)).order_by(Project.created_at.desc())
    )
    return await _batch_enrich_projects(db, res.scalars().all())


async def get_stats(db: AsyncSession) -> schema.ProjectStatsResponse:
    redis = await get_redis()
    cache_key = "projects:stats"
    if redis:
        try:
            cached = await redis.get(cache_key)
            if cached:
                data = json.loads(cached)
                return schema.ProjectStatsResponse(**data)
        except Exception:
            pass

    domain_res = await db.execute(
        select(Project.domain, func.count(Project.id))
        .where(Project.deleted_at.is_(None))
        .group_by(Project.domain)
    )
    by_domain = {d or "unspecified": count for d, count in domain_res.all()}

    status_res = await db.execute(
        select(Project.status, func.count(Project.id))
        .where(Project.deleted_at.is_(None))
        .group_by(Project.status)
    )
    by_status = {s or "ongoing": count for s, count in status_res.all()}

    total_res = await db.execute(
        select(func.count(Project.id)).where(Project.deleted_at.is_(None))
    )
    total = total_res.scalar_one()

    resp = schema.ProjectStatsResponse(by_domain=by_domain, by_status=by_status, total=total)

    if redis:
        try:
            await redis.setex(cache_key, 300, json.dumps(resp.model_dump()))
        except Exception:
            pass

    return resp
