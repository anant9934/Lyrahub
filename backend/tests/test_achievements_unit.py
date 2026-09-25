import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date
from fastapi import HTTPException

from app.modules.achievements.service import (
    get_achievements,
    create_achievement,
    verify_achievement
)
from app.modules.achievements.schema import AchievementCreate, AchievementResponse
from app.models import Achievement, Student, User


def test_achievement_schemas():
    data = AchievementCreate(
        title="Hackathon Winner",
        category="competition",
        level="national",
        issuer="IEEE",
        achieved_on=date(2026, 1, 15)
    )
    assert data.title == "Hackathon Winner"
    assert data.level == "national"


@pytest.mark.asyncio
async def test_get_achievements_service():
    db = AsyncMock()
    db.scalar.return_value = 1
    
    mock_ach = Achievement(
        id=uuid4(),
        person_id=uuid4(),
        person_type="student",
        title="Best Paper",
        is_verified=True
    )
    res_mock = MagicMock()
    res_mock.scalars.return_value.all.return_value = [mock_ach]
    db.execute.return_value = res_mock

    items, total = await get_achievements(
        db, person_type="student", category="academic", level="international",
        search="paper", page=1, page_size=10, force_verified=True
    )
    assert total == 1
    assert len(items) == 1
    assert items[0].title == "Best Paper"


@pytest.mark.asyncio
async def test_create_achievement_as_student():
    db = AsyncMock()
    student_user_id = uuid4()
    student_id = uuid4()
    user_obj = User(id=student_user_id, email="student@aiml.hub")

    # student lookup
    stud_mock = MagicMock()
    stud_mock.scalars.return_value.first.return_value = Student(id=student_id, user_id=student_user_id)
    db.execute.return_value = stud_mock

    data = AchievementCreate(title="ML Cert", category="certification")
    ach = await create_achievement(db, data, user_obj, role="student")
    assert ach.title == "ML Cert"
    assert ach.is_verified is False
    assert ach.person_id == student_id
    assert ach.person_type == "student"


@pytest.mark.asyncio
async def test_create_achievement_as_admin():
    db = AsyncMock()
    admin_id = uuid4()
    person_target_id = uuid4()
    admin_obj = User(id=admin_id, email="admin@aiml.hub")

    # Target is student
    stud_mock = MagicMock()
    stud_mock.scalars.return_value.first.return_value = Student(id=person_target_id)
    db.execute.return_value = stud_mock

    data = AchievementCreate(title="Dean List", category="academic", person_id=person_target_id)
    ach = await create_achievement(db, data, admin_obj, role="admin")
    assert ach.title == "Dean List"
    assert ach.is_verified is True
    assert ach.verified_by == admin_id


@pytest.mark.asyncio
async def test_verify_achievement_service():
    db = AsyncMock()
    hod_id = uuid4()
    hod_obj = User(id=hod_id, email="hod@aiml.hub")

    ach_id = uuid4()
    mock_ach = Achievement(id=ach_id, title="Unverified", is_verified=False)
    res_mock = MagicMock()
    res_mock.scalars.return_value.first.return_value = mock_ach
    db.execute.return_value = res_mock

    verified = await verify_achievement(db, str(ach_id), hod_obj)
    assert verified.is_verified is True
    assert verified.verified_by == hod_id
    db.commit.assert_called_once()
