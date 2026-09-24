import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_student_submits_achievement(async_client: AsyncClient, student_token: str):
    res = await async_client.post(
        "/api/v1/achievements",
        json={
            "title": "Hackathon Winner",
            "category": "competition",
            "level": "national",
            "issuer": "MLH"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Hackathon Winner"
    assert data["is_verified"] == False

@pytest.mark.asyncio
async def test_hod_verifies_achievement(async_client: AsyncClient, student_token: str, hod_token: str):
    res = await async_client.post(
        "/api/v1/achievements",
        json={"title": "To be verified"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    ach_id = res.json()["id"]

    res = await async_client.post(
        f"/api/v1/achievements/{ach_id}/verify",
        headers={"Authorization": f"Bearer {hod_token}"}
    )
    assert res.status_code == 200
    assert res.json()["is_verified"] == True

@pytest.mark.asyncio
async def test_student_cannot_verify(async_client: AsyncClient, student_token: str):
    res = await async_client.post(
        "/api/v1/achievements",
        json={"title": "Test Verify"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    ach_id = res.json()["id"]

    res = await async_client.post(
        f"/api/v1/achievements/{ach_id}/verify",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 403
