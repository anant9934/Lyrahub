import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from app.modules.stories.service import (
    slugify,
    generate_unique_slug,
    validate_person,
    get_stories,
    get_story_by_slug,
    create_story,
    update_story,
    delete_story,
    publish_story,
    feature_story,
    get_story_stats
)
from app.modules.stories import schema
from app.modules.stories import router as story_router
from app.models import SuccessStory, Student, Alumni, User


def test_story_schemas():
    data = schema.StoryCreate(
        title="Student Builds AI Robot",
        story_type="student",
        person_id=uuid4(),
        summary="Short teaser"
    )
    assert data.title == "Student Builds AI Robot"
    assert data.story_type == "student"

    up = schema.StoryUpdate(title="Updated Title")
    assert up.title == "Updated Title"


def test_slugify():
    assert slugify("Hello World! 2026") == "hello-world-2026"
    assert slugify("AI & Machine Learning") == "ai-machine-learning"
    assert slugify("---Leading Edge---") == "leading-edge"


@pytest.mark.asyncio
async def test_slug_auto_generation_and_collision():
    db = AsyncMock()
    # First test: no collision
    res_mock = MagicMock()
    res_mock.scalar_one_or_none.return_value = None
    db.execute.return_value = res_mock

    slug = await generate_unique_slug(db, "From Campus to Stanford")
    assert slug == "from-campus-to-stanford"

    # Second test: collision on base slug, available on -2
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value="collision")),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    ]
    slug2 = await generate_unique_slug(db, "From Campus to Stanford")
    assert slug2 == "from-campus-to-stanford-2"


@pytest.mark.asyncio
async def test_person_validation_student_and_alumni():
    db = AsyncMock()
    st_id = uuid4()
    al_id = uuid4()

    # Case 1: valid student
    st_mock = Student(id=st_id, user_id=uuid4(), reg_no="RA2111003010001")
    u_mock = User(id=st_mock.user_id, email="ananya.sharma@aiml.hub")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=st_mock)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=u_mock))
    ]
    name, role = await validate_person(db, "student", st_id)
    assert "Ananya" in name
    assert role == "Student"

    # Case 2: invalid student -> 400
    db.execute.side_effect = None
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    with pytest.raises(HTTPException) as exc:
        await validate_person(db, "student", uuid4())
    assert exc.value.status_code == 400

    # Case 3: valid alumni
    al_mock = Alumni(id=al_id, user_id=uuid4(), full_name="Rahul Verma", current_role="SDE-2 at Google")
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=al_mock))
    name_al, role_al = await validate_person(db, "alumni", al_id)
    assert name_al == "Rahul Verma"
    assert role_al == "SDE-2 at Google"

    # Case 4: invalid alumni -> 400
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    with pytest.raises(HTTPException) as exc_al:
        await validate_person(db, "alumni", uuid4())
    assert exc_al.value.status_code == 400

    # Case 5: invalid story_type -> 400
    with pytest.raises(HTTPException) as exc_inv:
        await validate_person(db, "invalid_type", uuid4())
    assert exc_inv.value.status_code == 400


@pytest.mark.asyncio
async def test_create_story_and_permissions():
    db = AsyncMock()
    user = User(id=uuid4(), email="faculty@aiml.hub")
    student_id = uuid4()

    # Mock student validation & slug
    st_mock = Student(id=student_id, user_id=uuid4())
    u_mock = User(id=st_mock.user_id, email="rahul@aiml.hub")
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=st_mock)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=u_mock)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # slug check
    ]

    data = schema.StoryCreate(
        title="Student Wins MIT Hackathon",
        story_type="student",
        person_id=student_id,
        summary="A student victory"
    )

    story = await create_story(db, data, user)
    assert story.title == "Student Wins MIT Hackathon"
    assert story.is_published is False
    assert story.created_by == user.id


@pytest.mark.asyncio
async def test_publish_and_feature_toggling():
    db = AsyncMock()
    creator_id = uuid4()
    user = User(id=creator_id, email="faculty@aiml.hub")
    other_user = User(id=uuid4(), email="student@aiml.hub")

    story = SuccessStory(
        id=uuid4(),
        slug="mit-hackathon",
        title="MIT Hackathon",
        story_type="student",
        person_id=uuid4(),
        created_by=creator_id,
        is_published=False,
        featured=False
    )

    # Mock find story
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=story))

    # Unauthorized user cannot publish
    with pytest.raises(HTTPException) as exc:
        await publish_story(db, story.id, other_user, is_admin_or_hod=False)
    assert exc.value.status_code == 403

    # Creator publishes -> 200
    published = await publish_story(db, story.id, user, is_admin_or_hod=False)
    assert published.is_published is True
    assert published.published_at is not None

    # Feature toggle by admin -> sets featured=True and unfeatures others
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=story))
    featured = await feature_story(db, story.id, user)
    assert featured.featured is True

    # Feature toggle again -> toggles off
    unfeatured = await feature_story(db, story.id, user)
    assert unfeatured.featured is False


@pytest.mark.asyncio
async def test_get_story_increments_views():
    db = AsyncMock()
    story = SuccessStory(
        id=uuid4(),
        slug="robotics-champ",
        title="Robotics Champ",
        is_published=True,
        views_count=5
    )
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=story)), # select
        MagicMock() # raw SQL UPDATE
    ]

    fetched = await get_story_by_slug(db, "robotics-champ")
    assert fetched.views_count == 6
    assert db.execute.call_count == 2


@pytest.mark.asyncio
async def test_delete_and_update_story():
    db = AsyncMock()
    creator_id = uuid4()
    user = User(id=creator_id, email="faculty@aiml.hub")
    story = SuccessStory(
        id=uuid4(),
        slug="ai-award",
        title="AI Award",
        created_by=creator_id,
        is_published=True
    )
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=story))

    up_data = schema.StoryUpdate(subtitle="New Subtitle")
    updated = await update_story(db, story.id, up_data, user, is_admin_or_hod=False)
    assert updated.subtitle == "New Subtitle"

    await delete_story(db, story.id, user, is_admin_or_hod=False)
    assert story.deleted_at is not None


@pytest.mark.asyncio
async def test_get_stories_and_stats():
    db = AsyncMock()
    items_mock = [SuccessStory(id=uuid4(), slug="s1", title="S1", is_published=True, featured=False)]
    db.execute.side_effect = [
        MagicMock(scalar_one=MagicMock(return_value=1)), # count
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=items_mock)))) # items
    ]

    items, total = await get_stories(
        db=db,
        story_type="student",
        batch_year=2024,
        tag="ai",
        featured=False,
        search="test",
        page=1,
        page_size=10
    )
    assert total == 1
    assert len(items) == 1

    # Test stats
    db.execute.side_effect = [
        MagicMock(all=MagicMock(return_value=[("student", 5), ("alumni", 3)])), # type
        MagicMock(all=MagicMock(return_value=[(2024, 4), (2025, 4)])), # batch
        MagicMock(one=MagicMock(return_value=(8, 6, 120))) # totals
    ]
    with patch("app.modules.stories.service.get_redis", return_value=None):
        stats = await get_story_stats(db)
        assert stats["total_stories"] == 8
        assert stats["by_type"]["student"] == 5


@pytest.mark.asyncio
async def test_story_router_all_endpoints():
    user = User(id=uuid4(), email="faculty@aiml.hub")
    db = AsyncMock()

    with patch("app.modules.stories.router._get_role", return_value="faculty"):
        # List stories
        with patch("app.modules.stories.service.get_stories", return_value=([], 0)):
            res_list = await story_router.list_stories(db=db, current_user=user)
            assert res_list["total"] == 0

        # Stats
        with patch("app.modules.stories.service.get_story_stats", return_value={"by_type": {}, "by_batch": {}, "total_stories": 0, "total_published": 0, "total_views": 0}):
            res_stats = await story_router.get_stories_stats(db=db)
            assert res_stats["total_stories"] == 0

        # Get by slug
        story_obj = SuccessStory(id=uuid4(), slug="test-slug", title="Test", story_type="student", person_id=uuid4())
        with patch("app.modules.stories.service.get_story_by_slug", return_value=story_obj):
            res_slug = await story_router.get_story(slug="test-slug", db=db, current_user=user)
            assert res_slug.slug == "test-slug"

        # Create story
        with patch("app.modules.stories.service.create_story", return_value=story_obj):
            res_cr = await story_router.create_story(
                data=schema.StoryCreate(title="Test", story_type="student", person_id=uuid4()),
                db=db,
                current_user=user
            )
            assert res_cr.title == "Test"

        # Update story
        with patch("app.modules.stories.service.update_story", return_value=story_obj):
            res_up = await story_router.update_story(
                id=story_obj.id,
                data=schema.StoryUpdate(title="Updated"),
                db=db,
                current_user=user
            )
            assert res_up.title == "Test"

        # Publish story
        with patch("app.modules.stories.service.publish_story", return_value=story_obj):
            res_pub = await story_router.publish_story(id=story_obj.id, db=db, current_user=user)
            assert res_pub.slug == "test-slug"

        # Delete story
        with patch("app.modules.stories.service.delete_story", return_value=None):
            await story_router.delete_story(id=story_obj.id, db=db, current_user=user)

    # Student permission checks
    student_user = User(id=uuid4(), email="student@aiml.hub")
    with patch("app.modules.stories.router._get_role", return_value="student"):
        with pytest.raises(HTTPException) as exc_cr:
            await story_router.create_story(
                data=schema.StoryCreate(title="Test", story_type="student", person_id=uuid4()),
                db=db,
                current_user=student_user
            )
        assert exc_cr.value.status_code == 403

        with pytest.raises(HTTPException) as exc_feat:
            await story_router.feature_story(id=story_obj.id, db=db, current_user=student_user)
        assert exc_feat.value.status_code == 403

    # HOD can feature
    hod_user = User(id=uuid4(), email="hod@aiml.hub")
    with patch("app.modules.stories.router._get_role", return_value="hod"):
        with patch("app.modules.stories.service.feature_story", return_value=story_obj):
            res_feat = await story_router.feature_story(id=story_obj.id, db=db, current_user=hod_user)
            assert res_feat.slug == "test-slug"
