import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime, date
from fastapi import HTTPException, UploadFile
import io

from app.modules.projects.service import (
    generate_unique_slug,
    get_projects,
    get_project_by_id_or_slug,
    create_project,
    update_project,
    delete_project,
    add_member,
    remove_member,
    add_document,
    get_project_documents,
    get_my_projects,
    get_projects_by_mentor,
    get_stats
)
from app.modules.projects import schema
from app.modules.projects import router as proj_router
from app.models import Project, ProjectMember, ProjectDocument, User, Student


def test_project_schemas():
    data = schema.ProjectCreate(
        title="Edge ML for Drones",
        domain="robotics",
        tech_stack=["PyTorch", "C++"],
        summary="Short summary"
    )
    assert data.title == "Edge ML for Drones"
    assert data.domain == "robotics"
    assert data.tech_stack == ["PyTorch", "C++"]

    up = schema.ProjectUpdate(status="completed")
    assert up.status == "completed"

    mem = schema.ProjectMemberCreate(student_id=uuid4(), role="lead")
    assert mem.role == "lead"


@pytest.mark.asyncio
async def test_generate_unique_slug():
    db = AsyncMock()
    # Mock no collisions
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    db.execute.return_value = res_mock

    slug = await generate_unique_slug(db, "Autonomous Driving 2026!")
    assert slug == "autonomous-driving-2026"

    # Mock collision on base slug, available on -2
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value="collision-exists")),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    ]
    slug2 = await generate_unique_slug(db, "Collision Test")
    assert slug2 == "collision-test-2"


@pytest.mark.asyncio
async def test_get_projects_service():
    db = AsyncMock()
    p1 = Project(id=uuid4(), title="P1", slug="p1", domain="cv", status="ongoing", tech_stack=["OpenCV"], created_at=datetime.utcnow(), is_public=True)
    p2 = Project(id=uuid4(), title="P2", slug="p2", domain="nlp", status="completed", tech_stack=["BERT"], created_at=datetime.utcnow(), is_public=True)

    count_mock = MagicMock(scalar_one=MagicMock(return_value=2))
    items_mock = MagicMock()
    items_mock.scalars.return_value.all.return_value = [p1, p2]
    empty_mem = MagicMock()
    empty_mem.all.return_value = []
    empty_docs = MagicMock()
    empty_docs.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        count_mock,
        items_mock,
        empty_mem, empty_docs,
        empty_mem, empty_docs
    ]

    items, total = await get_projects(db, domain="cv", status="ongoing", search="test", page=1, page_size=10, can_view_private=False)
    assert total == 2
    assert len(items) == 2


@pytest.mark.asyncio
async def test_get_project_by_id_or_slug():
    db = AsyncMock()
    proj_id = uuid4()
    p = Project(id=proj_id, title="P1", slug="p1", domain="cv", status="ongoing", tech_stack=[], created_at=datetime.utcnow())

    res_mock = MagicMock(scalar_one_or_none=MagicMock(return_value=p))
    empty_mem = MagicMock()
    empty_mem.all.return_value = []
    empty_docs = MagicMock()
    empty_docs.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        res_mock,
        empty_mem,
        empty_docs
    ]

    res = await get_project_by_id_or_slug(db, str(proj_id))
    assert res.id == proj_id

    # Not found case
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    ]
    with pytest.raises(HTTPException) as exc:
        await get_project_by_id_or_slug(db, "nonexistent")
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_project_validation():
    db = AsyncMock()
    user = User(id=uuid4(), email="stu@aiml.hub")

    # Student requires mentor
    with pytest.raises(HTTPException) as exc:
        await create_project(db, schema.ProjectCreate(title="No Mentor"), user, role="student")
    assert exc.value.status_code == 400

    # Faculty can create without mentor
    mentor_id = uuid4()
    mentor_user = User(id=mentor_id, email="mentor@aiml.hub")
    
    mentor_lookup_mock = MagicMock(scalar_one_or_none=MagicMock(return_value=mentor_user))
    slug_mock = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    empty_mem = MagicMock(all=MagicMock(return_value=[]))
    empty_docs = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[]))))
    mentor_name_mock = MagicMock(scalar_one_or_none=MagicMock(return_value="mentor@aiml.hub"))

    db.execute.side_effect = [
        mentor_lookup_mock, # 1. mentor existence check in create_project
        slug_mock,          # 2. slug check in generate_unique_slug
        empty_mem,          # 3. members in _enrich_project
        empty_docs,         # 4. docs in _enrich_project
        mentor_name_mock    # 5. mentor email in _enrich_project
    ]

    data = schema.ProjectCreate(title="Faculty LLM", domain="llm", mentor_id=mentor_id)
    proj = await create_project(db, data, user, role="faculty")
    assert proj.title == "Faculty LLM"
    assert proj.slug == "faculty-llm"


@pytest.mark.asyncio
async def test_update_project_and_permissions():
    db = AsyncMock()
    creator_id = uuid4()
    other_id = uuid4()
    proj = Project(
        id=uuid4(),
        title="Old Title",
        slug="old-title",
        status="ongoing",
        created_by=creator_id,
        tech_stack=[],
        created_at=datetime.utcnow()
    )

    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=proj))

    # Unauthorized user
    unauth_user = User(id=other_id, email="other@aiml.hub")
    with pytest.raises(HTTPException) as exc:
        await update_project(db, proj.id, schema.ProjectUpdate(title="New Title"), unauth_user, role="student")
    assert exc.value.status_code == 403

    # Creator can update
    creator_user = User(id=creator_id, email="creator@aiml.hub")
    empty_mem = MagicMock()
    empty_mem.all.return_value = []
    empty_docs = MagicMock()
    empty_docs.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=proj)),
        empty_mem,
        empty_docs
    ]
    updated = await update_project(db, proj.id, schema.ProjectUpdate(status="completed"), creator_user, role="student")
    assert updated.status == "completed"
    assert proj.end_date is not None


@pytest.mark.asyncio
async def test_delete_project_and_permissions():
    db = AsyncMock()
    creator_id = uuid4()
    proj = Project(id=uuid4(), title="Delete Me", created_by=creator_id)

    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=proj))

    # Unauthorized delete
    with pytest.raises(HTTPException) as exc:
        await delete_project(db, proj.id, User(id=uuid4(), email="u@aiml.hub"), role="student")
    assert exc.value.status_code == 403

    # Creator can delete
    await delete_project(db, proj.id, User(id=creator_id, email="creator@aiml.hub"), role="student")
    assert proj.deleted_at is not None


@pytest.mark.asyncio
async def test_add_and_remove_member():
    db = AsyncMock()
    creator_id = uuid4()
    proj_id = uuid4()
    student_id = uuid4()
    proj = Project(id=proj_id, title="Team Proj", created_by=creator_id)
    student = Student(id=student_id, reg_no="RA2311026010099")

    # Proj exists, student exists, duplicate check returns None
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=proj)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    ]

    res = await add_member(
        db,
        proj_id,
        schema.ProjectMemberCreate(student_id=student_id, role="contributor"),
        User(id=creator_id, email="creator@aiml.hub"),
        role="student"
    )
    assert res.role == "contributor"
    assert res.student_reg_no == "RA2311026010099"

    # Remove member
    mem = ProjectMember(id=uuid4(), project_id=proj_id, student_id=student_id)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=proj)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=mem))
    ]
    await remove_member(db, proj_id, student_id, User(id=creator_id, email="c@aiml.hub"), role="student")
    db.delete.assert_called_with(mem)


@pytest.mark.asyncio
async def test_get_my_projects_and_stats():
    db = AsyncMock()
    user_id = uuid4()
    user = User(id=user_id, email="u@aiml.hub")
    pid = uuid4()

    # get_my_projects: created, mentored, member
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[(pid,)])), # created
        MagicMock(all=MagicMock(return_value=[])),        # mentored
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # not student
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[
            Project(id=pid, title="P", slug="p", domain="cv", status="ongoing", tech_stack=[], created_at=datetime.utcnow())
        ])))),
        MagicMock(all=MagicMock(return_value=[])), # members
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))) # docs
    ]
    projs = await get_my_projects(db, user, role="faculty")
    assert len(projs) == 1

    # get_stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[("cv", 5), ("nlp", 3)])),
        MagicMock(all=MagicMock(return_value=[("ongoing", 6), ("completed", 2)])),
        MagicMock(scalar_one=MagicMock(return_value=8))
    ]
    with patch("app.modules.projects.service.get_redis", return_value=None):
        stats = await get_stats(db)
        assert stats.total == 8
        assert stats.by_domain["cv"] == 5
        assert stats.by_status["ongoing"] == 6


@pytest.mark.asyncio
async def test_project_router_endpoints():
    db = AsyncMock()
    user = User(id=uuid4(), email="prof@aiml.hub")
    proj_id = uuid4()

    with patch("app.modules.projects.router.service.get_projects", return_value=([], 0)):
        res = await proj_router.list_projects(db=db, current_user=user)
        assert res.total == 0

    with patch("app.modules.projects.router.service.get_project_by_id_or_slug", return_value=MagicMock(id=proj_id)):
        res = await proj_router.get_project_detail(id_or_slug=str(proj_id), db=db)
        assert res.id == proj_id

    with patch("app.modules.projects.router.service.create_project", return_value=MagicMock(id=proj_id)):
        with patch("app.modules.projects.router._get_role", return_value="faculty"):
            res = await proj_router.create_project(
                data=schema.ProjectCreate(title="Test Router"),
                db=db,
                current_user=user
            )
            assert res.id == proj_id

    with patch("app.modules.projects.router.service.update_project", return_value=MagicMock(id=proj_id)):
        with patch("app.modules.projects.router._get_role", return_value="faculty"):
            res = await proj_router.update_project(
                id=proj_id,
                data=schema.ProjectUpdate(title="Updated"),
                db=db,
                current_user=user
            )
            assert res.id == proj_id

    with patch("app.modules.projects.router.service.delete_project", return_value=None):
        with patch("app.modules.projects.router._get_role", return_value="faculty"):
            await proj_router.delete_project(id=proj_id, db=db, current_user=user)

    with patch("app.modules.projects.router.service.get_project_documents", return_value=[]):
        docs = await proj_router.list_project_documents(id=proj_id, db=db, current_user=user)
        assert docs == []

    with patch("app.modules.projects.router.service.get_my_projects", return_value=[]):
        with patch("app.modules.projects.router._get_role", return_value="faculty"):
            mine = await proj_router.get_my_projects(db=db, current_user=user)
            assert mine == []

    with patch("app.modules.projects.router.service.get_projects_by_mentor", return_value=[]):
        mentor_projs = await proj_router.get_projects_by_mentor(mentor_id=user.id, db=db)
        assert mentor_projs == []

    with patch("app.modules.projects.router.service.get_stats", return_value=MagicMock(total=10)):
        stats = await proj_router.get_project_stats(db=db)
        assert stats.total == 10
