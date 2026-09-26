import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from app.modules.programs.service import (
    slugify,
    generate_unique_slug,
    get_programs,
    get_program_by_slug,
    create_program,
    update_program,
    delete_program,
    add_program_course,
    remove_program_course
)
from app.modules.programs import schema
from app.modules.programs import router as prog_router
from app.models import Program, Course, ProgramCourse, User


def test_program_schema():
    data = schema.ProgramCreate(
        name="B.Tech Computer Science (AI & ML)",
        code="BTCS-AIML",
        degree="B.Tech",
        level="undergraduate",
        duration_years=4.0,
        total_credits=160
    )
    assert data.name == "B.Tech Computer Science (AI & ML)"
    assert data.code == "BTCS-AIML"
    assert data.duration_years == 4.0


@pytest.mark.asyncio
async def test_program_slug_auto_generation():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))

    slug = await generate_unique_slug(db, "B.Tech Computer Science (AI & ML)")
    assert slug == "btech-computer-science-ai-ml"


@pytest.mark.asyncio
async def test_program_slug_collision():
    db = AsyncMock()
    existing_prog = Program(id=uuid4(), slug="btech-ai", name="B.Tech AI")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_prog)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]

    slug = await generate_unique_slug(db, "B.Tech AI")
    assert slug == "btech-ai-1"


@pytest.mark.asyncio
async def test_create_program_hod():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    data = schema.ProgramCreate(
        name="M.Tech CSE (Machine Learning)",
        code="MTCS-ML",
        degree="M.Tech",
        level="postgraduate"
    )

    prog = await create_program(db, data, hod_user)
    assert prog.name == "M.Tech CSE (Machine Learning)"
    assert prog.code == "MTCS-ML"
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_create_program_student_forbidden():
    db = AsyncMock()
    student_user = User(id=uuid4(), email="student@aiml.hub")

    data = schema.ProgramCreate(
        name="M.Tech CSE (Machine Learning)",
        code="MTCS-ML",
        degree="M.Tech",
        level="postgraduate"
    )

    import sys
    prog_mod = sys.modules["app.modules.programs.router"]
    with patch.object(prog_mod, "_get_role", new=AsyncMock(return_value="student")):
        with pytest.raises(HTTPException) as exc_info:
            await prog_mod.create_program(data, db, student_user)
        assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_create_program_duplicate_code():
    db = AsyncMock()
    existing_prog = Program(id=uuid4(), code="BTCS-AIML")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=existing_prog))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    data = schema.ProgramCreate(
        name="B.Tech AI & ML",
        code="BTCS-AIML"
    )

    with pytest.raises(HTTPException) as exc_info:
        await create_program(db, data, hod_user)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_add_course_to_program():
    db = AsyncMock()
    prog_id = uuid4()
    course_id = uuid4()

    prog = Program(id=prog_id, name="B.Tech AIML")
    course = Course(id=course_id, code="CS301", name="Deep Learning")

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=prog)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=course)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]

    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    data = schema.ProgramCourseMap(course_id=course_id, semester=5, is_mandatory=True)

    mapping = await add_program_course(db, prog_id, data, hod_user)
    assert mapping.semester == 5
    assert mapping.is_mandatory is True
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_add_course_to_program_duplicate():
    db = AsyncMock()
    prog_id = uuid4()
    course_id = uuid4()

    prog = Program(id=prog_id, name="B.Tech AIML")
    course = Course(id=course_id, code="CS301", name="Deep Learning")
    existing_map = ProgramCourse(id=uuid4(), program_id=prog_id, course_id=course_id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=prog)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=course)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_map)),
    ]

    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    data = schema.ProgramCourseMap(course_id=course_id, semester=5)

    with pytest.raises(HTTPException) as exc_info:
        await add_program_course(db, prog_id, data, hod_user)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_get_programs_public():
    db = AsyncMock()
    p1 = Program(id=uuid4(), slug="btcs-aiml", name="B.Tech AIML", degree="B.Tech", level="undergraduate", duration_years=4.0)
    p2 = Program(id=uuid4(), slug="mtcs-mlai", name="M.Tech MLAI", degree="M.Tech", level="postgraduate", duration_years=2.0)

    db.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[p1, p2]))))

    items, total = await get_programs(db)
    assert total == 2
    assert len(items) == 2
    assert items[0].slug == "btcs-aiml"


@pytest.mark.asyncio
async def test_get_program_by_slug_with_courses():
    db = AsyncMock()
    prog_id = uuid4()
    p = Program(
        id=prog_id,
        slug="btcs-aiml",
        code="BTCS-AIML",
        name="B.Tech AIML",
        program_outcomes=["PO1", "PO2"],
        program_specific_outcomes=["PSO1"]
    )

    c1 = Course(id=uuid4(), code="CS301", name="Deep Learning", slug="deep-learning", credits=4.0, course_type="core")
    c_map = ProgramCourse(id=uuid4(), program_id=prog_id, course_id=c1.id, semester=5, is_mandatory=True)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=p)),
        MagicMock(all=MagicMock(return_value=[(c_map, c1)])),
    ]

    res = await get_program_by_slug(db, "btcs-aiml")
    assert res["code"] == "BTCS-AIML"
    assert 5 in res["curriculum"]
    assert len(res["curriculum"][5]) == 1
    assert res["curriculum"][5][0]["course_code"] == "CS301"


@pytest.mark.asyncio
async def test_delete_program():
    db = AsyncMock()
    p = Program(id=uuid4(), slug="test-prog", name="Test")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=p))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    await delete_program(db, p.id, hod_user)
    assert p.deleted_at is not None
    assert db.commit.called


@pytest.mark.asyncio
async def test_update_program():
    db = AsyncMock()
    p = Program(id=uuid4(), slug="test-prog", name="Old Name", code="OLD-1")
    # First query gets p, second query checks slug for uniqueness -> returns None
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=p)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    update_data = schema.ProgramUpdate(name="New Name")
    updated = await update_program(db, p.id, update_data, hod_user)
    assert updated.name == "New Name"
    assert db.commit.called


@pytest.mark.asyncio
async def test_remove_program_course():
    db = AsyncMock()
    prog_id = uuid4()
    course_id = uuid4()
    pc = ProgramCourse(id=uuid4(), program_id=prog_id, course_id=course_id)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=pc))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    await remove_program_course(db, prog_id, course_id, hod_user)
    assert db.commit.called


@pytest.mark.asyncio
async def test_program_router_endpoints():
    db = AsyncMock()
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    prog_id = uuid4()
    p = Program(id=prog_id, slug="prog-1", name="Prog 1", code="P1", degree="B.Tech", level="undergraduate", duration_years=4.0)

    import sys
    prog_mod = sys.modules["app.modules.programs.router"]

    with patch.object(prog_mod, "_get_role", new=AsyncMock(return_value="hod")):
        # List
        with patch.object(prog_mod.service, "get_programs", new=AsyncMock(return_value=([p], 1))):
            res = await prog_mod.list_programs(db=db, current_user=hod_user)
            assert res["total"] == 1

        # Get
        with patch.object(prog_mod.service, "get_program_by_slug", new=AsyncMock(return_value={"id": prog_id, "name": "Prog 1", "slug": "prog-1", "code": "P1", "curriculum": {}})):
            res = await prog_mod.get_program(slug="prog-1", db=db, current_user=hod_user)
            assert res["name"] == "Prog 1"

        # Update
        with patch.object(prog_mod.service, "update_program", new=AsyncMock(return_value=p)):
            res = await prog_mod.update_program(id=prog_id, data=schema.ProgramUpdate(name="Updated"), db=db, current_user=hod_user)
            assert res.name == "Prog 1"

        # Delete
        with patch.object(prog_mod.service, "delete_program", new=AsyncMock()):
            res = await prog_mod.delete_program(id=prog_id, db=db, current_user=hod_user)
            assert res["message"] == "Program successfully deleted"

        # Add course
        with patch.object(prog_mod.service, "add_program_course", new=AsyncMock(return_value=ProgramCourse(id=uuid4(), program_id=prog_id, course_id=uuid4(), semester=1))):
            res = await prog_mod.add_program_course(id=prog_id, data=schema.ProgramCourseMap(course_id=uuid4(), semester=1), db=db, current_user=hod_user)
            assert "message" in res

        # Remove course
        with patch.object(prog_mod.service, "remove_program_course", new=AsyncMock()):
            res = await prog_mod.remove_program_course(id=prog_id, course_id=uuid4(), db=db, current_user=hod_user)
            assert res["message"] == "Course mapping removed successfully"

