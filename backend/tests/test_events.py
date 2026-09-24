import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_create_event_faculty(async_client: AsyncClient, faculty_token: str):
    res = await async_client.post(
        "/api/v1/events",
        json={
            "title": "Tech Summit 2026",
            "description": "Annual tech summit",
            "event_type": "conference",
            "capacity": 100,
            "start_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "end_datetime": (datetime.utcnow() + timedelta(days=3)).isoformat()
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Tech Summit 2026"
    assert data["status"] == "draft"

@pytest.mark.asyncio
async def test_create_event_student_blocked(async_client: AsyncClient, student_token: str):
    res = await async_client.post(
        "/api/v1/events",
        json={"title": "Unauthorized Event"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 403

@pytest.mark.asyncio
async def test_publish_event(async_client: AsyncClient, faculty_token: str):
    res = await async_client.post(
        "/api/v1/events",
        json={"title": "To be published"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    event_id = res.json()["id"]
    
    res = await async_client.post(
        f"/api/v1/events/{event_id}/publish",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res.status_code == 200

@pytest.mark.asyncio
async def test_register_event(async_client: AsyncClient, student_token: str, faculty_token: str):
    res = await async_client.post(
        "/api/v1/events",
        json={"title": "Student Register Test"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    event_id = res.json()["id"]
    
    # Must be published to register
    await async_client.post(f"/api/v1/events/{event_id}/publish", headers={"Authorization": f"Bearer {faculty_token}"})
    
    res = await async_client.post(
        f"/api/v1/events/{event_id}/register",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 201

    # Register twice
    res = await async_client.post(
        f"/api/v1/events/{event_id}/register",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 409
