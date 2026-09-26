import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, timezone
from fastapi import HTTPException

from app.modules.leadership.service import (
    list_leadership,
    get_leadership_by_role,
    get_leadership_by_id,
    get_department_stats,
    create_leadership,
    update_leadership,
    delete_leadership
)
from app.modules.leadership import schema
from app.models import LeadershipProfile, Student, Faculty, Project, User

def test_leadership_schemas():
    data = schema.LeadershipCreate(
        role="hod",
        display_title="Head of Department",
        experience_years=15,
        publications_count=35,
        qualifications=["Ph.D. IIT Bombay"]
    )
    assert data.role == "hod"
    assert data.display_title == "Head of Department"
    assert data.experience_years == 15

@pytest.mark.asyncio
async def test_list_leadership():
    db = AsyncMock()
    # Count check for ensure default
    count_mock = MagicMock()
    count_mock.scalar.return_value = 3
    # List query
    items_mock = MagicMock()
    items_mock.scalars.return_value.all.return_value = [
        LeadershipProfile(id=uuid4(), role="hod", display_title="HOD AI/ML", is_active=True)
    ]
    db.execute.side_effect = [count_mock, items_mock]

    profiles = await list_leadership(db)
    assert len(profiles) == 1
    assert profiles[0].role == "hod"

@pytest.mark.asyncio
async def test_get_leadership_by_role():
    db = AsyncMock()
    count_mock = MagicMock()
    count_mock.scalar.return_value = 3
    profile = LeadershipProfile(
        id=uuid4(),
        role="hod",
        display_title="Head of Department",
        is_active=True
    )
    profile_mock = MagicMock()
    profile_mock.scalar_one_or_none.return_value = profile
    db.execute.side_effect = [count_mock, profile_mock]

    res = await get_leadership_by_role(db, "hod")
    assert res.role == "hod"
    assert res.display_title == "Head of Department"

@pytest.mark.asyncio
async def test_get_department_stats():
    db = AsyncMock()
    st_mock = MagicMock(scalar=MagicMock(return_value=500))
    fac_mock = MagicMock(scalar=MagicMock(return_value=35))
    pl_mock = MagicMock(scalar=MagicMock(return_value=120))
    pr_mock = MagicMock(scalar=MagicMock(return_value=40))
    pub_mock = MagicMock(scalar=MagicMock(return_value=85))

    db.execute.side_effect = [st_mock, fac_mock, pl_mock, pr_mock, pub_mock]

    stats = await get_department_stats(db, "hod")
    assert stats.total_students == 500
    assert stats.total_faculty == 35
    assert stats.total_placements == 120
    assert stats.total_projects == 40

@pytest.mark.asyncio
async def test_create_and_update_leadership():
    db = AsyncMock()
    admin_id = uuid4()
    create_in = schema.LeadershipCreate(
        role="hod",
        display_title="Dr. Sharma",
        email="hod@aiml.edu"
    )

    created = await create_leadership(db, create_in, admin_id)
    assert created.role == "hod"
    assert created.display_title == "Dr. Sharma"
    assert db.add.called
    assert db.commit.called

    # Update
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=created))
    update_in = schema.LeadershipUpdate(display_title="Prof. Dr. Sharma")
    updated = await update_leadership(db, created.id, update_in, admin_id)
    assert updated.display_title == "Prof. Dr. Sharma"

@pytest.mark.asyncio
async def test_delete_leadership():
    db = AsyncMock()
    admin_id = uuid4()
    profile = LeadershipProfile(id=uuid4(), role="cos", is_active=True)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=profile))

    res = await delete_leadership(db, profile.id, admin_id)
    assert res["message"] == "Leadership profile successfully deleted"
    assert profile.is_active is False
    assert profile.deleted_at is not None
    assert db.commit.called
