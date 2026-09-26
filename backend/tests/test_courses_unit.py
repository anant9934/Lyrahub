import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from app.modules.courses.service import (
    slugify,
    generate_unique_slug,
    get_courses,
    get_course_by_slug,
    get_course_by_code,
    create_course,
    update_course,
    delete_course,
    assign_course_faculty,
    remove_course_faculty,
    get_course_faculty_list,
    get_my_courses,
    get_course_stats
)
from app.modules.courses import schema
from app.modules.courses import router as course_router
from app.models import Course, CourseFaculty, User, Student, Faculty


def test_course_schema():
    data = schema.CourseCreate(
        code="cs301",
        name="Deep Learning",
        credits=4.0,
        semester=5,
        year=3,
        course_type="core",
        category="theory",
        learning_outcomes=["CO1: CNNs", "CO2: RNNs"],
        edurev_benefits=["RPL eligible"]
    )
    assert data.code == "cs301"
    assert data.credits == 4.0
    assert len(data.learning_outcomes) == 2


@pytest.mark.asyncio
async def test_create_course_hod():
    db = AsyncMock()
    # Code uniqueness check returns None, slug check returns None
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    data = schema.CourseCreate(
        code="cs301",
        name="Deep Learning",
        credits=4.0,
        semester=5
    )

    course = await create_course(db, data, hod_user)
    assert course.code == "CS301"  # Uppercase normalization
    assert course.slug == "deep-learning"
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_create_course_duplicate_code():
    db = AsyncMock()
    existing_c = Course(id=uuid4(), code="CS301", name="Deep Learning")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=existing_c))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    data = schema.CourseCreate(
        code="CS301",
        name="Deep Learning Foundations",
        credits=4.0
    )

    with pytest.raises(HTTPException) as exc_info:
        await create_course(db, data, hod_user)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_add_faculty_to_course():
    db = AsyncMock()
    course_id = uuid4()
    faculty_id = uuid4()

    c = Course(id=course_id, code="CS301", name="Deep Learning")
    fac_user = User(id=faculty_id, email="prof.sharma@aiml.hub")

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=c)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=fac_user)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # No duplicate assignment
    ]

    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    data = schema.CourseFacultyAssign(
        faculty_id=faculty_id,
        academic_year="2025-26",
        section="A",
        role="primary"
    )

    cf = await assign_course_faculty(db, course_id, data, hod_user)
    assert cf.academic_year == "2025-26"
    assert cf.section == "A"
    assert cf.role == "primary"
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_add_faculty_duplicate_assignment():
    db = AsyncMock()
    course_id = uuid4()
    faculty_id = uuid4()

    c = Course(id=course_id, code="CS301", name="Deep Learning")
    fac_user = User(id=faculty_id, email="prof.sharma@aiml.hub")
    existing_assignment = CourseFaculty(
        id=uuid4(),
        course_id=course_id,
        faculty_id=faculty_id,
        academic_year="2025-26",
        section="A"
    )

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=c)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=fac_user)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_assignment)),
    ]

    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    data = schema.CourseFacultyAssign(
        faculty_id=faculty_id,
        academic_year="2025-26",
        section="A"
    )

    with pytest.raises(HTTPException) as exc_info:
        await assign_course_faculty(db, course_id, data, hod_user)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_get_courses_public():
    db = AsyncMock()
    c1 = Course(id=uuid4(), slug="cs101", code="CS101", name="Intro to Prog", credits=4.0, semester=1, is_active=True)
    c2 = Course(id=uuid4(), slug="cs301", code="CS301", name="Deep Learning", credits=4.0, semester=5, is_active=True)

    db.execute.side_effect = [
        MagicMock(scalar_one=MagicMock(return_value=2)),
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[c1, c2])))),
    ]

    items, total = await get_courses(db)
    assert total == 2
    assert len(items) == 2
    assert items[0].code == "CS101"


@pytest.mark.asyncio
async def test_get_course_by_code():
    db = AsyncMock()
    c = Course(id=uuid4(), slug="cs301-deep-learning", code="CS301", name="Deep Learning", credits=4.0)
    
    # 1. code query -> c
    # 2. in get_course_by_slug:
    #    a. select course -> c
    #    b. faculty query -> []
    #    c. programs query -> []
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=c)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=c)),
        MagicMock(all=MagicMock(return_value=[])),
        MagicMock(all=MagicMock(return_value=[])),
    ]

    res = await get_course_by_code(db, "cs301")
    assert res["code"] == "CS301"
    assert res["slug"] == "cs301-deep-learning"


@pytest.mark.asyncio
async def test_get_course_by_code_not_found():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))

    with pytest.raises(HTTPException) as exc_info:
        await get_course_by_code(db, "CS999")
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_my_courses_faculty():
    db = AsyncMock()
    fac_user = User(id=uuid4(), email="prof@aiml.hub")
    c1 = Course(id=uuid4(), code="CS301", name="Deep Learning", slug="deep-learning", credits=4.0)

    db.execute.return_value = MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[c1]))))

    res = await get_my_courses(db, fac_user, "faculty")
    assert len(res) == 1
    assert res[0].code == "CS301"


@pytest.mark.asyncio
async def test_update_course():
    db = AsyncMock()
    c = Course(id=uuid4(), code="CS301", name="Deep Learning", credits=4.0)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=c)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    up_data = schema.CourseUpdate(name="Advanced Deep Learning", credits=4.5)
    updated = await update_course(db, c.id, up_data, hod_user)
    assert updated.name == "Advanced Deep Learning"
    assert updated.credits == 4.5
    assert db.commit.called


@pytest.mark.asyncio
async def test_delete_course():
    db = AsyncMock()
    c = Course(id=uuid4(), code="CS301", name="Deep Learning")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=c))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    await delete_course(db, c.id, hod_user)
    assert c.deleted_at is not None
    assert db.commit.called


@pytest.mark.asyncio
async def test_course_faculty_list_and_remove():
    db = AsyncMock()
    course_id = uuid4()
    faculty_id = uuid4()
    cf = CourseFaculty(id=uuid4(), course_id=course_id, faculty_id=faculty_id, academic_year="2025-26", section="A", role="primary")
    u = User(id=faculty_id, email="prof@aiml.hub")

    # get_course_faculty_list
    db.execute.return_value = MagicMock(all=MagicMock(return_value=[(cf, "prof@aiml.hub")]))
    fac_list = await get_course_faculty_list(db, course_id)
    assert len(fac_list) == 1
    assert fac_list[0]["faculty_email"] == "prof@aiml.hub"

    # remove_course_faculty
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=cf))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    await remove_course_faculty(db, course_id, faculty_id, hod_user)
    assert db.commit.called


@pytest.mark.asyncio
async def test_course_stats():
    db = AsyncMock()
    # 1. semester stats
    # 2. type stats
    # 3. category stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[(5, 4)])),
        MagicMock(all=MagicMock(return_value=[("core", 8)])),
        MagicMock(all=MagicMock(return_value=[("theory", 10)])),
    ]

    stats = await get_course_stats(db)
    assert "by_semester" in stats
    assert "by_type" in stats
    assert "by_category" in stats


@pytest.mark.asyncio
async def test_course_router_endpoints():
    db = AsyncMock()
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    c_id = uuid4()
    c = Course(id=c_id, code="CS301", name="Deep Learning", slug="deep-learning", credits=4.0)

    import sys
    course_mod = sys.modules["app.modules.courses.router"]

    with patch.object(course_mod, "_get_role", new=AsyncMock(return_value="hod")):
        # List
        with patch.object(course_mod.service, "get_courses", new=AsyncMock(return_value=([c], 1))):
            res = await course_mod.list_courses(db=db, current_user=hod_user)
            assert res["total"] == 1

        # Get by slug
        with patch.object(course_mod.service, "get_course_by_slug", new=AsyncMock(return_value={"id": c_id, "code": "CS301", "name": "Deep Learning", "slug": "deep-learning", "credits": 4.0})):
            res = await course_mod.get_course(slug="deep-learning", db=db, current_user=hod_user)
            assert res["code"] == "CS301"

        # Get by code
        with patch.object(course_mod.service, "get_course_by_code", new=AsyncMock(return_value={"id": c_id, "code": "CS301", "name": "Deep Learning", "slug": "deep-learning", "credits": 4.0})):
            res = await course_mod.get_course_by_code(code="CS301", db=db, current_user=hod_user)
            assert res["code"] == "CS301"

        # Update
        with patch.object(course_mod.service, "update_course", new=AsyncMock(return_value=c)):
            res = await course_mod.update_course(id=c_id, data=schema.CourseUpdate(name="Updated DL"), db=db, current_user=hod_user)
            assert res.name == "Deep Learning"

        # Delete
        with patch.object(course_mod.service, "delete_course", new=AsyncMock()):
            res = await course_mod.delete_course(id=c_id, db=db, current_user=hod_user)
            assert res["message"] == "Course successfully deleted"

        # Stats
        with patch.object(course_mod.service, "get_course_stats", new=AsyncMock(return_value={"by_semester": {}, "by_type": {}, "by_category": {}})):
            res = await course_mod.get_course_stats(db=db)
            assert "by_semester" in res

