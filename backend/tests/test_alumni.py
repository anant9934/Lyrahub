import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_alumni_public(async_client: AsyncClient):
    email = f"alumni_{uuid.uuid4().hex[:6]}@aiml.hub"
    res = await async_client.post(
        "/api/v1/alumni/register",
        json={
            "email": email,
            "password": "password123",
            "full_name": "Priya Sharma",
            "graduation_year": 2023,
            "current_company": "NVIDIA",
            "current_role": "CUDA Engineer",
            "privacy_level": "public"
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == email
    assert data["is_verified"] == False


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    email = f"alumni_dup_{uuid.uuid4().hex[:6]}@aiml.hub"
    payload = {
        "email": email,
        "password": "password123",
        "full_name": "Duplicate Test",
        "graduation_year": 2024
    }
    res1 = await async_client.post("/api/v1/alumni/register", json=payload)
    assert res1.status_code == 201

    res2 = await async_client.post("/api/v1/alumni/register", json=payload)
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_register_with_matching_reg_no(async_client: AsyncClient, student_token: str):
    # Fetch existing student reg_no
    stu_res = await async_client.get("/api/v1/students/me", headers={"Authorization": f"Bearer {student_token}"})
    student_reg_no = stu_res.json()["reg_no"]

    email = f"alumni_reg_{uuid.uuid4().hex[:6]}@aiml.hub"
    res = await async_client.post(
        "/api/v1/alumni/register",
        json={
            "email": email,
            "password": "password123",
            "reg_no": student_reg_no
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["reg_no"] == student_reg_no
    assert data["full_name"] is not None
    assert data["graduation_year"] is not None


@pytest.mark.asyncio
async def test_login_as_new_alumni_and_add_experience(async_client: AsyncClient):
    email = f"alumni_exp_{uuid.uuid4().hex[:6]}@aiml.hub"
    pwd = "password123"
    await async_client.post(
        "/api/v1/alumni/register",
        json={"email": email, "password": pwd, "full_name": "Experience User", "graduation_year": 2023}
    )

    login_res = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Add experience
    exp_res = await async_client.post(
        "/api/v1/alumni/me/experience",
        json={
            "company": "DeepMind",
            "role": "AI Researcher",
            "start_date": "2023-08-01",
            "description": "LLM alignment"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert exp_res.status_code == 201
    assert exp_res.json()["company"] == "DeepMind"


@pytest.mark.asyncio
async def test_hod_verifies_alumni_and_student_blocked(async_client: AsyncClient, hod_token: str, student_token: str):
    email = f"alumni_v_{uuid.uuid4().hex[:6]}@aiml.hub"
    r = await async_client.post(
        "/api/v1/alumni/register",
        json={"email": email, "password": "password123", "full_name": "Verify Me", "graduation_year": 2022}
    )
    alumni_id = r.json()["id"]

    # Student cannot verify -> 403
    s_verify = await async_client.post(
        f"/api/v1/alumni/{alumni_id}/verify",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert s_verify.status_code == 403

    # HOD verify -> 200
    h_verify = await async_client.post(
        f"/api/v1/alumni/{alumni_id}/verify",
        headers={"Authorization": f"Bearer {hod_token}"}
    )
    assert h_verify.status_code == 200
    assert h_verify.json()["is_verified"] == True


@pytest.mark.asyncio
async def test_alumni_privacy_levels(async_client: AsyncClient, hod_token: str, student_token: str):
    email = f"alumni_priv_{uuid.uuid4().hex[:6]}@aiml.hub"
    pwd = "password123"
    reg = await async_client.post(
        "/api/v1/alumni/register",
        json={
            "email": email,
            "password": pwd,
            "full_name": "Alumni Only User",
            "graduation_year": 2021,
            "privacy_level": "alumni_only"
        }
    )
    alumni_id = reg.json()["id"]

    # HOD verifies it
    await async_client.post(f"/api/v1/alumni/{alumni_id}/verify", headers={"Authorization": f"Bearer {hod_token}"})

    # Student queries -> should NOT see alumni_only user
    s_res = await async_client.get("/api/v1/alumni", headers={"Authorization": f"Bearer {student_token}"})
    s_ids = [a["id"] for a in s_res.json()["items"]]
    assert alumni_id not in s_ids

    # Login as this alumni -> query list -> SHOULD see own/alumni_only
    login = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": pwd},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    alumni_token = login.json()["access_token"]

    a_res = await async_client.get("/api/v1/alumni", headers={"Authorization": f"Bearer {alumni_token}"})
    a_ids = [a["id"] for a in a_res.json()["items"]]
    assert alumni_id in a_ids


@pytest.mark.asyncio
async def test_alumni_stats_endpoint(async_client: AsyncClient):
    res = await async_client.get("/api/v1/alumni/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "by_graduation_year" in data
    assert "by_company" in data
