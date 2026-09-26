import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

from app.modules.opportunities.service import (
    slugify,
    generate_unique_slug,
    get_opportunities,
    get_opportunity_by_slug,
    create_opportunity,
    update_opportunity,
    delete_opportunity,
    verify_opportunity,
    apply_to_opportunity,
    withdraw_application,
    update_application_status,
    get_opportunity_applications,
    get_my_opportunities,
    get_upcoming_opportunities,
    get_opportunity_stats
)
from app.modules.opportunities import schema
from app.modules.opportunities import router as opp_router
from app.models import Opportunity, OpportunityApplication, Student, User


def test_opportunity_schema():
    data = schema.OpportunityCreate(
        title="AI Engineer Intern",
        organization="Google DeepMind",
        opportunity_type="internship",
        mode="hybrid",
        stipend_amount=80000.0,
        duration_weeks=12,
        required_skills=["PyTorch", "Transformers"]
    )
    assert data.title == "AI Engineer Intern"
    assert data.organization == "Google DeepMind"
    assert data.stipend_amount == 80000.0


@pytest.mark.asyncio
async def test_create_opportunity_faculty_unverified():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    fac_user = User(id=uuid4(), email="prof@aiml.hub")

    data = schema.OpportunityCreate(
        title="Research Fellowship in Vision Transformers",
        organization="AI Lab",
        opportunity_type="fellowship"
    )

    opp = await create_opportunity(db, data, fac_user, "faculty")
    assert opp.is_verified is False
    assert opp.posted_by == fac_user.id
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_create_opportunity_alumni_unverified():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    alumni_user = User(id=uuid4(), email="alumni@techcorp.com")

    data = schema.OpportunityCreate(
        title="Junior ML Engineer Internship",
        organization="TechCorp",
        opportunity_type="internship"
    )

    opp = await create_opportunity(db, data, alumni_user, "alumni")
    assert opp.is_verified is False
    assert opp.posted_by == alumni_user.id


@pytest.mark.asyncio
async def test_create_opportunity_student_forbidden():
    db = AsyncMock()
    student_user = User(id=uuid4(), email="student@aiml.hub")

    data = schema.OpportunityCreate(
        title="Student Posting",
        organization="Student Club",
        opportunity_type="internship"
    )

    with pytest.raises(HTTPException) as exc_info:
        await create_opportunity(db, data, student_user, "student")
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_verify_opportunity_hod():
    db = AsyncMock()
    opp_id = uuid4()
    opp = Opportunity(
        id=opp_id,
        title="Robotics Intern",
        organization="RoboTech",
        is_verified=False
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=opp))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    res = await verify_opportunity(db, opp_id, hod_user)
    assert res.is_verified is True
    assert res.verified_by == hod_user.id
    assert res.verified_at is not None
    assert db.commit.called


@pytest.mark.asyncio
async def test_apply_opportunity_student_success():
    db = AsyncMock()
    opp_id = uuid4()
    student_user = User(id=uuid4(), email="student@aiml.hub")
    student = Student(id=uuid4(), user_id=student_user.id, reg_no="RA2111003010001")

    # Future deadline
    future_deadline = datetime.now(timezone.utc) + timedelta(days=10)
    opp = Opportunity(id=opp_id, title="ML Intern", is_active=True, application_deadline=future_deadline)

    # 1. student check -> student
    # 2. opportunity check -> opp
    # 3. duplicate application check -> None
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=opp)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]

    app = await apply_to_opportunity(db, opp_id, student_user)
    assert app.status == "interested"
    assert app.student_id == student.id
    assert db.add.called
    assert db.commit.called


@pytest.mark.asyncio
async def test_apply_opportunity_duplicate_conflict():
    db = AsyncMock()
    opp_id = uuid4()
    student_user = User(id=uuid4(), email="student@aiml.hub")
    student = Student(id=uuid4(), user_id=student_user.id)
    opp = Opportunity(id=opp_id, title="ML Intern", is_active=True)
    existing_app = OpportunityApplication(id=uuid4(), opportunity_id=opp_id, student_id=student.id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=opp)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_app)),
    ]

    with pytest.raises(HTTPException) as exc_info:
        await apply_to_opportunity(db, opp_id, student_user)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_apply_opportunity_deadline_passed():
    db = AsyncMock()
    opp_id = uuid4()
    student_user = User(id=uuid4(), email="student@aiml.hub")
    student = Student(id=uuid4(), user_id=student_user.id)

    # Expired deadline
    past_deadline = datetime.now(timezone.utc) - timedelta(days=2)
    opp = Opportunity(id=opp_id, title="ML Intern", is_active=True, application_deadline=past_deadline)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=opp)),
    ]

    with pytest.raises(HTTPException) as exc_info:
        await apply_to_opportunity(db, opp_id, student_user)
    assert exc_info.value.status_code == 400
    assert "deadline" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_withdraw_application():
    db = AsyncMock()
    opp_id = uuid4()
    student_user = User(id=uuid4(), email="student@aiml.hub")
    student = Student(id=uuid4(), user_id=student_user.id)
    app = OpportunityApplication(id=uuid4(), opportunity_id=opp_id, student_id=student.id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=app)),
        MagicMock(),  # delete statement execution
    ]

    await withdraw_application(db, opp_id, student_user)
    assert db.commit.called


@pytest.mark.asyncio
async def test_update_application_status_hod():
    db = AsyncMock()
    opp_id = uuid4()
    student_id = uuid4()
    app = OpportunityApplication(id=uuid4(), opportunity_id=opp_id, student_id=student_id, status="applied")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=app))
    hod_user = User(id=uuid4(), email="hod@aiml.hub")

    data = schema.OpportunityApplicationUpdate(status="selected", notes="Selected after technical interview round")
    res = await update_application_status(db, opp_id, student_id, data, hod_user)
    assert res.status == "selected"
    assert res.notes == "Selected after technical interview round"
    assert db.commit.called


@pytest.mark.asyncio
async def test_get_upcoming_opportunities():
    db = AsyncMock()
    now = datetime.now(timezone.utc)
    d1 = now + timedelta(days=3)
    d2 = now + timedelta(days=7)

    opp1 = Opportunity(id=uuid4(), slug="opp-1", title="Opp 1", organization="Org 1", opportunity_type="internship", application_deadline=d1, is_active=True, is_verified=True)
    opp2 = Opportunity(id=uuid4(), slug="opp-2", title="Opp 2", organization="Org 2", opportunity_type="training", application_deadline=d2, is_active=True, is_verified=True)

    db.execute.return_value = MagicMock(all=MagicMock(return_value=[
        (opp1, "admin@hub.edu"),
        (opp2, "prof@hub.edu"),
    ]))

    upcoming = await get_upcoming_opportunities(db, limit=5)
    assert len(upcoming) == 2
    assert upcoming[0]["slug"] == "opp-1"
    assert upcoming[1]["slug"] == "opp-2"


@pytest.mark.asyncio
async def test_update_opportunity():
    db = AsyncMock()
    opp_id = uuid4()
    user_id = uuid4()
    opp = Opportunity(id=opp_id, title="ML Intern", organization="AI Corp", posted_by=user_id)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=opp)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)),
    ]
    user = User(id=user_id, email="poster@hub.edu")

    up_data = schema.OpportunityUpdate(title="Senior ML Intern", location="Bangalore")
    res = await update_opportunity(db, opp_id, up_data, user, is_admin_or_hod=False)
    assert res.title == "Senior ML Intern"
    assert res.location == "Bangalore"
    assert db.commit.called


@pytest.mark.asyncio
async def test_delete_opportunity():
    db = AsyncMock()
    opp_id = uuid4()
    user_id = uuid4()
    opp = Opportunity(id=opp_id, slug="opp-1", posted_by=user_id)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=opp))
    user = User(id=user_id, email="poster@hub.edu")

    await delete_opportunity(db, opp_id, user, is_admin_or_hod=False)
    assert opp.deleted_at is not None
    assert db.commit.called


@pytest.mark.asyncio
async def test_get_opportunity_stats():
    db = AsyncMock()
    # 1. by_type
    # 2. by_organization
    # 3. total and verified
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[("internship", 10), ("training", 5)])),
        MagicMock(all=MagicMock(return_value=[("Google", 3), ("Microsoft", 2)])),
        MagicMock(one=MagicMock(return_value=(15, 12))),
    ]

    stats = await get_opportunity_stats(db)
    assert stats["total_opportunities"] == 15
    assert stats["total_verified"] == 12
    assert stats["by_type"]["internship"] == 10
    assert stats["by_organization"]["Google"] == 3


@pytest.mark.asyncio
async def test_get_opportunity_applications():
    db = AsyncMock()
    opp_id = uuid4()
    user_id = uuid4()
    opp = Opportunity(id=opp_id, posted_by=user_id)
    user = User(id=user_id, email="poster@hub.edu")

    app = OpportunityApplication(id=uuid4(), opportunity_id=opp_id, student_id=uuid4(), status="interested")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=opp)),
        MagicMock(all=MagicMock(return_value=[(app, "RA2111003010001", "student@hub.edu")])),
    ]

    apps = await get_opportunity_applications(db, opp_id, user, is_admin_or_hod=True)
    assert len(apps) == 1
    assert apps[0]["student_reg_no"] == "RA2111003010001"


@pytest.mark.asyncio
async def test_opportunity_router_endpoints():
    db = AsyncMock()
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    opp_id = uuid4()
    opp_dict = {
        "id": opp_id,
        "slug": "ml-intern",
        "title": "ML Intern",
        "organization": "AI Hub",
        "opportunity_type": "internship",
        "posted_by": hod_user.id,
        "is_verified": True,
        "applicants_count": 2
    }

    import sys
    opp_mod = sys.modules["app.modules.opportunities.router"]

    with patch.object(opp_mod, "_get_role", new=AsyncMock(return_value="hod")):
        # List
        with patch.object(opp_mod.service, "get_opportunities", new=AsyncMock(return_value=([opp_dict], 1))):
            res = await opp_mod.list_opportunities(db=db, current_user=hod_user)
            assert res["total"] == 1

        # Stats
        with patch.object(opp_mod.service, "get_opportunity_stats", new=AsyncMock(return_value={"by_type": {}, "by_organization": {}, "total_opportunities": 1, "total_verified": 1})):
            res = await opp_mod.get_opportunity_stats(db=db)
            assert res["total_opportunities"] == 1

        # Upcoming
        with patch.object(opp_mod.service, "get_upcoming_opportunities", new=AsyncMock(return_value=[opp_dict])):
            res = await opp_mod.get_upcoming_opportunities(db=db)
            assert len(res) == 1

        # Get by slug
        with patch.object(opp_mod.service, "get_opportunity_by_slug", new=AsyncMock(return_value=opp_dict)):
            res = await opp_mod.get_opportunity(slug="ml-intern", db=db, current_user=hod_user)
            assert res["title"] == "ML Intern"

        # Delete
        with patch.object(opp_mod.service, "delete_opportunity", new=AsyncMock()):
            res = await opp_mod.delete_opportunity(id=opp_id, db=db, current_user=hod_user)
            assert res["message"] == "Opportunity deleted successfully"

