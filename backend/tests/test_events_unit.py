import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

from app.modules.events.service import (
    generate_slug,
    get_events,
    get_event_by_id_or_slug,
    create_event,
    update_event,
    register_student
)
from app.modules.events.schema import EventCreate, EventUpdate, EventFeedbackCreate
from app.models import Event, Student, EventRegistration, User


def test_generate_slug():
    assert generate_slug("AI Workshop", []) == "ai-workshop"
    assert generate_slug("AI Workshop!", ["ai-workshop"]) == "ai-workshop-2"
    assert generate_slug("AI Workshop", ["ai-workshop", "ai-workshop-2"]) == "ai-workshop-3"
    assert generate_slug("---Special #Chars---", []) == "special-chars"


def test_event_schemas():
    data = EventCreate(title="Test Summit", event_type="hackathon", mode="hybrid", capacity=50)
    assert data.title == "Test Summit"
    assert data.capacity == 50

    update_data = EventUpdate(title="New Title", capacity=75)
    assert update_data.title == "New Title"
    assert update_data.capacity == 75

    fb = EventFeedbackCreate(rating=5, comments="Great event")
    assert fb.rating == 5


@pytest.mark.asyncio
async def test_get_events_service():
    db = AsyncMock()
    # Mock scalar count
    db.scalar.return_value = 2
    
    mock_event1 = Event(id=uuid4(), title="E1", slug="e1", status="published")
    mock_event2 = Event(id=uuid4(), title="E2", slug="e2", status="published")
    
    res_mock = MagicMock()
    res_mock.scalars.return_value.all.return_value = [mock_event1, mock_event2]
    db.execute.return_value = res_mock

    items, total = await get_events(
        db, status="published", event_type="workshop", category="technical",
        mode="online", search="test", page=1, page_size=10, force_published=True
    )
    assert total == 2
    assert len(items) == 2


@pytest.mark.asyncio
async def test_get_event_by_id_or_slug_found_and_not_found():
    db = AsyncMock()
    mock_event = Event(id=uuid4(), title="E1", slug="e1", status="published")
    res_mock = MagicMock()
    res_mock.scalars.return_value.first.return_value = mock_event
    db.execute.return_value = res_mock
    db.scalar.return_value = 5

    ev = await get_event_by_id_or_slug(db, str(mock_event.id))
    assert ev.id == mock_event.id
    assert ev.registration_count == 5

    # Not found case
    res_mock.scalars.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc:
        await get_event_by_id_or_slug(db, "nonexistent-slug")
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_event_service():
    db = AsyncMock()
    res_mock = MagicMock()
    res_mock.scalars.return_value.all.return_value = []
    db.execute.return_value = res_mock

    user_id = uuid4()
    data = EventCreate(title="Unique Hackathon", event_type="hackathon", capacity=100)
    ev = await create_event(db, data, user_id)
    assert ev.slug == "unique-hackathon"
    assert ev.status == "draft"
    db.add.assert_called()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_event_service():
    db = AsyncMock()
    organizer_id = uuid4()
    other_user = uuid4()
    ev = Event(id=uuid4(), title="Draft Event", slug="draft-event", organizer_id=organizer_id, status="draft")
    
    res_mock = MagicMock()
    res_mock.scalars.return_value.first.return_value = ev
    db.execute.return_value = res_mock
    db.scalar.return_value = 0

    user_obj = User(id=organizer_id, email="org@aiml.hub")
    updated = await update_event(db, str(ev.id), EventUpdate(title="Updated Title"), user_obj, role="faculty")
    assert updated.title == "Updated Title"

    # Unauthorized update
    unauth_user = User(id=other_user, email="student@aiml.hub")
    with pytest.raises(HTTPException) as exc:
        await update_event(db, str(ev.id), EventUpdate(title="Hacked Title"), unauth_user, role="student")
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_register_student_service():
    db = AsyncMock()
    user_id = uuid4()
    student_id = uuid4()
    event_id = uuid4()
    ev = Event(
        id=event_id,
        title="Pub Event",
        slug="pub-event",
        status="published",
        capacity=2,
        registration_deadline=datetime.now(timezone.utc) + timedelta(days=1)
    )

    res_mock = MagicMock()
    res_mock.scalars.return_value.first.return_value = ev
    db.execute.return_value = res_mock
    db.scalar.side_effect = [0, 0, None]  # registration count, capacity check, existing registration

    stud_mock = MagicMock()
    stud_mock.scalars.return_value.first.return_value = Student(id=student_id, user_id=user_id)
    
    # Custom db.execute to return ev first, then student
    db.execute.side_effect = [
        res_mock,  # get_event_by_id_or_slug
        stud_mock, # select student
    ]

    user_obj = User(id=user_id, email="s@aiml.hub")
    res = await register_student(db, event_id, user_obj)
    assert res == {"message": "Registered successfully"}
