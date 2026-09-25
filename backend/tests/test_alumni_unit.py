import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime, date
from fastapi import HTTPException

from app.modules.alumni.service import (
    register_alumni,
    get_alumni_list,
    get_alumni_by_id,
    get_my_alumni_profile,
    update_my_alumni_profile,
    verify_alumni,
    add_experience,
    remove_experience,
    get_mentors,
    get_stats
)
from app.modules.alumni import schema
from app.modules.alumni import router as alm_router
from app.models import Alumni, AlumniExperience, User, Student


def test_alumni_schemas():
    reg = schema.AlumniRegisterRequest(
        email="test@aiml.hub",
        password="password123",
        full_name="Alumni Test",
        graduation_year=2023,
        program="B.Tech CSE (AI & ML)"
    )
    assert reg.email == "test@aiml.hub"
    assert reg.graduation_year == 2023

    up = schema.AlumniUpdate(current_company="Google", current_role="SWE")
    assert up.current_company == "Google"

    exp = schema.AlumniExperienceCreate(
        company="Microsoft",
        role="Research Intern",
        start_date=date(2022, 5, 1)
    )
    assert exp.company == "Microsoft"


@pytest.mark.asyncio
async def test_register_alumni_duplicate_email():
    db = AsyncMock()
    # Mock existing user
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=User(id=uuid4(), email="dup@aiml.hub")))

    with pytest.raises(HTTPException) as exc:
        await register_alumni(db, schema.AlumniRegisterRequest(
            email="dup@aiml.hub",
            password="password123",
            full_name="Dup",
            graduation_year=2023
        ))
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_register_alumni_auto_populate_from_student():
    db = AsyncMock()
    student_id = uuid4()
    user_id = uuid4()
    student = Student(id=student_id, user_id=user_id, reg_no="RA2011003010123")

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # existing_user
        MagicMock(first=MagicMock(return_value=(student, "john.doe@aiml.hub"))), # student match
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))) # experiences
    ]

    with patch("app.modules.alumni.service.get_enforcer", return_value=None):
        res = await register_alumni(db, schema.AlumniRegisterRequest(
            email="newalumni@aiml.hub",
            password="password123",
            reg_no="RA2011003010123"
        ))
        assert res.full_name == "John Doe"
        assert res.reg_no == "RA2011003010123"
        assert res.is_verified is False


@pytest.mark.asyncio
async def test_get_alumni_list_service():
    db = AsyncMock()
    user_id = uuid4()
    a1 = Alumni(
        id=uuid4(),
        user_id=user_id,
        full_name="A1",
        email="a1@aiml.hub",
        graduation_year=2023,
        privacy_level="public",
        is_verified=True,
        created_at=datetime.utcnow()
    )
    a2 = Alumni(
        id=uuid4(),
        user_id=uuid4(),
        full_name="A2",
        email="a2@aiml.hub",
        graduation_year=2022,
        privacy_level="alumni_only",
        is_verified=True,
        created_at=datetime.utcnow()
    )

    count_mock = MagicMock(scalar_one=MagicMock(return_value=2))
    items_mock = MagicMock()
    items_mock.scalars.return_value.all.return_value = [a1, a2]
    empty_exp = MagicMock()
    empty_exp.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        count_mock,
        items_mock,
        empty_exp,
        empty_exp
    ]

    items, total = await get_alumni_list(
        db,
        caller_user=User(id=user_id, email="alumni@aiml.hub"),
        caller_role="alumni",
        graduation_year=2023,
        company="NVIDIA",
        program="B.Tech",
        location="Bangalore",
        open_to_mentorship=True,
        open_to_hiring=False,
        search="A",
        page=1,
        page_size=10
    )
    assert total == 2
    assert len(items) == 2


@pytest.mark.asyncio
async def test_get_alumni_by_id_and_not_found():
    db = AsyncMock()
    alumni_id = uuid4()
    a = Alumni(
        id=alumni_id,
        user_id=uuid4(),
        full_name="Found",
        email="found@aiml.hub",
        graduation_year=2023,
        created_at=datetime.utcnow()
    )

    empty_exp = MagicMock()
    empty_exp.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=a)),
        empty_exp
    ]

    res = await get_alumni_by_id(db, alumni_id)
    assert res.id == alumni_id
    assert res.full_name == "Found"

    # Not found
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    ]
    with pytest.raises(HTTPException) as exc:
        await get_alumni_by_id(db, uuid4())
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_update_my_profile_and_verify():
    db = AsyncMock()
    user_id = uuid4()
    user = User(id=user_id, email="alumni@aiml.hub")
    a = Alumni(
        id=uuid4(),
        user_id=user_id,
        full_name="Original Name",
        email="alumni@aiml.hub",
        graduation_year=2021,
        current_company="OldCo",
        is_verified=False,
        created_at=datetime.utcnow()
    )

    empty_exp = MagicMock()
    empty_exp.scalars.return_value.all.return_value = []

    # Update profile
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=a)),
        empty_exp
    ]
    updated = await update_my_alumni_profile(
        db,
        user,
        schema.AlumniUpdate(current_company="NewCo", open_to_mentorship=True)
    )
    assert updated.current_company == "NewCo"
    assert a.open_to_mentorship is True

    # Verify alumni
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=a)),
        empty_exp
    ]
    verified = await verify_alumni(db, a.id, hod_user)
    assert verified.is_verified is True
    assert a.verified_by == hod_user.id
    assert a.verified_at is not None


@pytest.mark.asyncio
async def test_experience_add_and_remove():
    db = AsyncMock()
    user_id = uuid4()
    alumni_id = uuid4()
    user = User(id=user_id, email="alumni@aiml.hub")
    a = Alumni(id=alumni_id, user_id=user_id, full_name="A")

    # Add experience
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=a))
    exp_res = await add_experience(
        db,
        user,
        schema.AlumniExperienceCreate(company="Meta", role="Staff Engineer", start_date=date(2023, 1, 1))
    )
    assert exp_res.company == "Meta"
    assert exp_res.role == "Staff Engineer"

    # Remove experience - unauth
    exp_id = uuid4()
    exp_obj = AlumniExperience(id=exp_id, alumni_id=alumni_id, company="Meta")
    db.execute.return_value = MagicMock(first=MagicMock(return_value=(exp_obj, uuid4()))) # different user
    with pytest.raises(HTTPException) as exc:
        await remove_experience(db, user, exp_id)
    assert exc.value.status_code == 403

    # Remove experience - authorized
    db.execute.return_value = MagicMock(first=MagicMock(return_value=(exp_obj, user_id)))
    await remove_experience(db, user, exp_id)
    db.delete.assert_called_with(exp_obj)


@pytest.mark.asyncio
async def test_get_mentors_and_stats():
    db = AsyncMock()
    mentor_alumni = Alumni(
        id=uuid4(),
        user_id=uuid4(),
        full_name="Mentor Joe",
        email="joe@aiml.hub",
        open_to_mentorship=True,
        is_verified=True,
        graduation_year=2020,
        created_at=datetime.utcnow()
    )

    empty_exp = MagicMock()
    empty_exp.scalars.return_value.all.return_value = []

    db.execute.side_effect = [
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[mentor_alumni])))),
        empty_exp
    ]

    mentors = await get_mentors(db)
    assert len(mentors) == 1
    assert mentors[0].full_name == "Mentor Joe"

    # Stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[(2023, 10), (2022, 15)])),
        MagicMock(all=MagicMock(return_value=[("Google", 4), ("Meta", 3)])),
        MagicMock(all=MagicMock(return_value=[("B.Tech CSE (AI & ML)", 25)])),
        MagicMock(scalar_one=MagicMock(return_value=25))
    ]
    with patch("app.modules.alumni.service.get_redis", return_value=None):
        stats = await get_stats(db)
        assert stats.total == 25
        assert stats.by_graduation_year["2023"] == 10
        assert stats.by_company["Google"] == 4
        assert stats.by_program["B.Tech CSE (AI & ML)"] == 25


@pytest.mark.asyncio
async def test_alumni_router_endpoints():
    db = AsyncMock()
    user = User(id=uuid4(), email="hod@aiml.hub")
    alm_id = uuid4()

    with patch("app.modules.alumni.router.service.get_alumni_list", return_value=([], 0)):
        res = await alm_router.list_alumni(db=db, current_user=user)
        assert res.total == 0

    with patch("app.modules.alumni.router.service.get_alumni_by_id", return_value=MagicMock(id=alm_id)):
        res = await alm_router.get_alumni_detail(id=alm_id, db=db)
        assert res.id == alm_id

    with patch("app.modules.alumni.router.service.register_alumni", return_value=MagicMock(id=alm_id)):
        res = await alm_router.register_alumni(
            data=schema.AlumniRegisterRequest(email="reg@aiml.hub", password="password123", graduation_year=2023),
            db=db
        )
        assert res.id == alm_id

    with patch("app.modules.alumni.router.service.verify_alumni", return_value=MagicMock(id=alm_id)):
        with patch("app.modules.alumni.router._get_role", return_value="hod"):
            res = await alm_router.verify_alumni(id=alm_id, db=db, current_user=user)
            assert res.id == alm_id

    with patch("app.modules.alumni.router.service.get_my_alumni_profile", return_value=MagicMock(id=alm_id)):
        res = await alm_router.get_my_profile(db=db, current_user=user)
        assert res.id == alm_id

    with patch("app.modules.alumni.router.service.update_my_alumni_profile", return_value=MagicMock(id=alm_id)):
        res = await alm_router.update_my_profile(
            data=schema.AlumniUpdate(bio="Bio"),
            db=db,
            current_user=user
        )
        assert res.id == alm_id

    with patch("app.modules.alumni.router.service.add_experience", return_value=MagicMock(id=uuid4())):
        exp = await alm_router.add_my_experience(
            data=schema.AlumniExperienceCreate(company="Meta", role="SWE", start_date=date(2023, 1, 1)),
            db=db,
            current_user=user
        )
        assert exp is not None

    with patch("app.modules.alumni.router.service.remove_experience", return_value=None):
        await alm_router.delete_my_experience(id=uuid4(), db=db, current_user=user)

    with patch("app.modules.alumni.router.service.get_mentors", return_value=[]):
        mentors = await alm_router.get_alumni_mentors(db=db)
        assert mentors == []

    with patch("app.modules.alumni.router.service.get_stats", return_value=MagicMock(total=50)):
        stats = await alm_router.get_alumni_stats(db=db)
        assert stats.total == 50
