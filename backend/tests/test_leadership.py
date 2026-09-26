import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_leadership_public_endpoints(async_client: AsyncClient):
    # 1. Public list
    res = await async_client.get("/api/v1/leadership")
    assert res.status_code == 200
    profiles = res.json()
    assert isinstance(profiles, list)
    assert len(profiles) >= 3

    # 2. Public HOD profile
    hod_res = await async_client.get("/api/v1/leadership/hod")
    assert hod_res.status_code == 200
    hod_data = hod_res.json()
    assert hod_data["role"] == "hod"
    assert "Head of Department" in hod_data["display_title"]

    # 3. Public stats
    stats_res = await async_client.get("/api/v1/leadership/hod/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_students"] > 0
    assert stats["total_faculty"] > 0

@pytest.mark.asyncio
async def test_leadership_admin_authorization(
    async_client: AsyncClient,
    student_token: str,
    faculty_token: str
):
    # Non-admin student cannot create leadership profile
    stud_res = await async_client.post(
        "/api/v1/leadership",
        json={
            "role": "hod",
            "display_title": "Fake Leader"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert stud_res.status_code == 403

    # Admin/Super Admin creates leadership profile
    adm_res = await async_client.post(
        "/api/v1/leadership",
        json={
            "role": "hod",
            "display_title": f"Interim Dean {uuid.uuid4().hex[:6]}",
            "experience_years": 12,
            "publications_count": 25,
            "display_order": 99
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert adm_res.status_code == 201
    assert "Interim Dean" in adm_res.json()["display_title"]

    # Clean up test profile so subsequent tests stay isolated
    created_id = adm_res.json()["id"]
    del_res = await async_client.delete(
        f"/api/v1/leadership/{created_id}",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert del_res.status_code in [200, 204]
