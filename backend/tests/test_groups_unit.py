import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime, date
from fastapi import HTTPException
from decimal import Decimal

from app.modules.groups.service import (
    slugify,
    generate_unique_slug,
    validate_faculty_advisor,
    get_groups,
    get_group_by_slug,
    create_group,
    update_group,
    delete_group,
    verify_group,
    join_group,
    leave_group,
    add_group_member,
    update_member_role,
    get_group_members,
    link_group_event,
    get_my_groups,
    get_group_stats
)
from app.modules.groups import schema
from app.modules.groups import router as grp_router
from app.models import Group, GroupMember, GroupEvent, Student, Faculty, Event, User


def test_group_schemas():
    data = schema.GroupCreate(
        name="AI & Robotics Society",
        category="technical",
        group_type="society",
        membership_fee=Decimal("150.00")
    )
    assert data.name == "AI & Robotics Society"
    assert data.category == "technical"
    assert data.membership_fee == Decimal("150.00")

    mem_add = schema.GroupMemberAdd(student_id=uuid4(), role="core")
    assert mem_add.role == "core"


@pytest.mark.asyncio
async def test_slug_auto_generation():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    slug = await generate_unique_slug(db, "AI Innovators Club")
    assert slug == "ai-innovators-club"


@pytest.mark.asyncio
async def test_create_and_verify_group():
    db = AsyncMock()
    admin_user = User(id=uuid4(), email="hod@aiml.hub")

    # Mock slug check
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))

    data = schema.GroupCreate(
        name="Competitive Programming Guild",
        group_type="club",
        category="technical"
    )

    group = await create_group(db, data, admin_user)
    assert group.name == "Competitive Programming Guild"
    assert group.is_official is False # False initially

    # HOD verifies group
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=group))
    verified = await verify_group(db, group.id, admin_user)
    assert verified.is_official is True


@pytest.mark.asyncio
async def test_join_and_duplicate_join_group():
    db = AsyncMock()
    user = User(id=uuid4(), email="student@aiml.hub")
    student = Student(id=uuid4(), user_id=user.id)
    group = Group(id=uuid4(), name="Data Science Club", membership_open=True, membership_fee=Decimal("0.00"))

    # Case 1: First time join -> 201
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)), # student check
        MagicMock(scalar_one_or_none=MagicMock(return_value=group)),   # group check
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))     # existing member None
    ]
    member = await join_group(db, group.id, user)
    assert member.role == "member"
    assert member.is_active is True

    # Case 2: Duplicate join -> 409 Conflict
    existing_active = GroupMember(id=uuid4(), group_id=group.id, student_id=student.id, is_active=True)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=group)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_active))
    ]
    with pytest.raises(HTTPException) as exc:
        await join_group(db, group.id, user)
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_leave_group_and_promote_core_member():
    db = AsyncMock()
    user = User(id=uuid4(), email="lead.student@aiml.hub")
    lead_student = Student(id=uuid4(), user_id=user.id)
    group_id = uuid4()

    lead_member = GroupMember(id=uuid4(), group_id=group_id, student_id=lead_student.id, role="lead", is_active=True)
    next_core_member = GroupMember(id=uuid4(), group_id=group_id, student_id=uuid4(), role="core", is_active=True)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=lead_student)), # student check
        MagicMock(scalar_one_or_none=MagicMock(return_value=lead_member)),  # find member
        MagicMock(scalars=MagicMock(return_value=MagicMock(first=MagicMock(return_value=next_core_member)))), # next core
        MagicMock() # update group student_lead_id
    ]

    await leave_group(db, group_id, user)
    assert lead_member.is_active is False
    assert next_core_member.role == "lead"


@pytest.mark.asyncio
async def test_only_one_active_lead_enforced():
    db = AsyncMock()
    group_id = uuid4()
    admin = User(id=uuid4(), email="admin@aiml.hub")
    new_lead_student_id = uuid4()

    target_member = GroupMember(id=uuid4(), group_id=group_id, student_id=new_lead_student_id, role="core", is_active=True)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=target_member)), # find target member
        MagicMock(), # update demoting existing lead to core
        MagicMock()  # update group lead_id
    ]

    updated = await update_member_role(db, group_id, new_lead_student_id, "lead", admin, is_authorized=True)
    assert updated.role == "lead"


@pytest.mark.asyncio
async def test_add_group_member_and_get_members():
    db = AsyncMock()
    group_id = uuid4()
    st_id = uuid4()
    admin = User(id=uuid4(), email="admin@aiml.hub")

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=Student(id=st_id))), # student exists
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))               # not yet member
    ]
    added = await add_group_member(
        db=db,
        group_id=group_id,
        data=schema.GroupMemberAdd(student_id=st_id, role="core"),
        user=admin,
        is_authorized=True
    )
    assert added.role == "core"

    # List members
    gm_mock = GroupMember(id=uuid4(), group_id=group_id, student_id=st_id, role="core", is_active=True)
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[(gm_mock, "RA2111003010100", "test@aiml.hub")]))
    ]
    members = await get_group_members(db, group_id)
    assert len(members) == 1
    assert members[0]["student_reg_no"] == "RA2111003010100"


@pytest.mark.asyncio
async def test_link_group_event():
    db = AsyncMock()
    admin = User(id=uuid4(), email="admin@aiml.hub")
    event = Event(id=uuid4(), title="AI Summit 2026")
    group_id = uuid4()

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=event)), # event check
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))   # existing link check
    ]

    ge = await link_group_event(db, group_id, event.id, admin, is_authorized=True)
    assert ge.event_id == event.id
    assert ge.group_id == group_id


@pytest.mark.asyncio
async def test_get_groups_detail_and_stats():
    db = AsyncMock()
    group_obj = Group(
        id=uuid4(),
        slug="ai-club",
        name="AI Club",
        group_type="club",
        category="technical",
        is_official=True,
        is_active=True
    )

    # get_groups
    db.execute.side_effect = [
        MagicMock(scalar_one=MagicMock(return_value=1)),                                # count
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[group_obj])))), # groups
        MagicMock(scalar_one=MagicMock(return_value=12))                                # member_count
    ]
    items, total = await get_groups(db=db, is_official=True)
    assert total == 1
    assert items[0]["member_count"] == 12

    # get_group_by_slug
    gm = GroupMember(id=uuid4(), group_id=group_obj.id, student_id=uuid4(), role="lead", is_active=True)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=group_obj)), # group by slug
        MagicMock(all=MagicMock(return_value=[(gm, "RA2111", "lead@aiml.hub")])), # members
        MagicMock(all=MagicMock(return_value=[])) # events
    ]
    detail = await get_group_by_slug(db, "ai-club")
    assert detail["name"] == "AI Club"
    assert len(detail["members"]) == 1

    # get_group_stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[("club", 4), ("society", 2)])), # type
        MagicMock(all=MagicMock(return_value=[("technical", 5), ("sports", 1)])), # cat
        MagicMock(one=MagicMock(return_value=(6, 3))), # totals
        MagicMock(scalar_one=MagicMock(return_value=45)) # total_members
    ]
    stats = await get_group_stats(db)
    assert stats["total_groups"] == 6
    assert stats["total_official"] == 3
    assert stats["total_members"] == 45


@pytest.mark.asyncio
async def test_update_and_delete_group():
    db = AsyncMock()
    user = User(id=uuid4(), email="hod@aiml.hub")
    g = Group(id=uuid4(), slug="old-club", name="Old Club", is_active=True)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=g)), # find group
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # unique slug check
        MagicMock(scalar_one_or_none=MagicMock(return_value=g))  # delete group
    ]
    up = await update_group(db, g.id, schema.GroupUpdate(name="Updated Club"), user, is_admin_or_hod=True)
    assert up.name == "Updated Club"

    await delete_group(db, g.id, user)
    assert g.deleted_at is not None
    assert g.is_active is False


@pytest.mark.asyncio
async def test_group_router_all_endpoints():
    user = User(id=uuid4(), email="student@aiml.hub")
    hod = User(id=uuid4(), email="hod@aiml.hub")
    db = AsyncMock()
    g_id = uuid4()
    g_resp = {
        "id": g_id,
        "slug": "ai-guild",
        "name": "AI Guild",
        "group_type": "club",
        "category": "technical",
        "is_official": True,
        "is_active": True,
        "member_count": 5
    }

    # List
    with patch("app.modules.groups.router._get_role", return_value="student"):
        with patch("app.modules.groups.service.get_groups", return_value=([g_resp], 1)):
            res_list = await grp_router.list_groups(db=db, current_user=user)
            assert res_list["total"] == 1

        with patch("app.modules.groups.service.get_groups", return_value=([g_resp], 1)):
            res_off = await grp_router.list_official_groups(db=db)
            assert res_off["total"] == 1

        with patch("app.modules.groups.service.get_my_groups", return_value=[g_resp]):
            res_my = await grp_router.get_my_groups(db=db, current_user=user)
            assert len(res_my) == 1

        with patch("app.modules.groups.service.get_group_stats", return_value={"by_type": {}, "by_category": {}, "total_groups": 1, "total_official": 1, "total_members": 5}):
            res_st = await grp_router.get_groups_stats(db=db)
            assert res_st["total_groups"] == 1

        with patch("app.modules.groups.service.get_group_by_slug", return_value={**g_resp, "members": [], "events": []}):
            res_slug = await grp_router.get_group(slug="ai-guild", db=db, current_user=user)
            assert res_slug["name"] == "AI Guild"

        # Student cannot create group -> 403
        with pytest.raises(HTTPException) as exc_create:
            await grp_router.create_group(data=schema.GroupCreate(name="Club"), db=db, current_user=user)
        assert exc_create.value.status_code == 403

        # Join and leave
        gm_mock = GroupMember(id=uuid4(), group_id=g_id, student_id=uuid4(), role="member", is_active=True)
        with patch("app.modules.groups.service.join_group", return_value=gm_mock):
            res_join = await grp_router.join_group(id=g_id, db=db, current_user=user)
            assert res_join.role == "member"

        with patch("app.modules.groups.service.leave_group", return_value=None):
            res_leave = await grp_router.leave_group(id=g_id, db=db, current_user=user)
            assert "Successfully left" in res_leave["message"]

    # HOD Actions
    with patch("app.modules.groups.router._get_role", return_value="hod"):
        grp_obj = Group(id=g_id, slug="ai-guild", name="AI Guild", group_type="club", category="technical")
        with patch("app.modules.groups.service.create_group", return_value=grp_obj):
            res_cr = await grp_router.create_group(data=schema.GroupCreate(name="AI Guild"), db=db, current_user=hod)
            assert res_cr.name == "AI Guild"

        with patch("app.modules.groups.service.verify_group", return_value=grp_obj):
            res_ver = await grp_router.verify_group(id=g_id, db=db, current_user=hod)
            assert res_ver.name == "AI Guild"

        with patch("app.modules.groups.service.update_group", return_value=grp_obj):
            res_up = await grp_router.update_group(id=g_id, data=schema.GroupUpdate(name="AI Guild 2"), db=db, current_user=hod)
            assert res_up.name == "AI Guild"

        with patch("app.modules.groups.service.delete_group", return_value=None):
            await grp_router.delete_group(id=g_id, db=db, current_user=hod)

        # Member operations as HOD
        gm_lead = GroupMember(id=uuid4(), group_id=g_id, student_id=uuid4(), role="lead", is_active=True)
        with patch("app.modules.groups.service.add_group_member", return_value=gm_lead):
            res_add_m = await grp_router.add_group_member(
                id=g_id,
                data=schema.GroupMemberAdd(student_id=gm_lead.student_id, role="lead"),
                db=db,
                current_user=hod
            )
            assert res_add_m.role == "lead"

        with patch("app.modules.groups.service.update_member_role", return_value=gm_lead):
            res_up_m = await grp_router.update_member_role(
                id=g_id,
                student_id=gm_lead.student_id,
                body=schema.GroupMemberRoleUpdate(role="core"),
                db=db,
                current_user=hod
            )
            assert res_up_m.role == "lead"

        ge_mock = GroupEvent(id=uuid4(), group_id=g_id, event_id=uuid4())
        with patch("app.modules.groups.service.link_group_event", return_value=ge_mock):
            res_link = await grp_router.link_group_event(
                id=g_id,
                body=schema.GroupEventLink(event_id=ge_mock.event_id),
                db=db,
                current_user=hod
            )
            assert res_link.event_id == ge_mock.event_id

        with patch("app.modules.groups.service.get_group_members", return_value=[]):
            res_mems = await grp_router.list_group_members(id=g_id, db=db, current_user=hod)
            assert res_mems == []
