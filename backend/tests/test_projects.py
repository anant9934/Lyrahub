import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_project_student_without_mentor(async_client: AsyncClient, student_token: str):
    res = await async_client.post(
        "/api/v1/projects",
        json={"title": f"No Mentor Project {uuid.uuid4().hex[:6]}"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 400
    assert "Mentor is required" in res.json()["detail"]


@pytest.mark.asyncio
async def test_create_project_student_with_mentor(async_client: AsyncClient, student_token: str, faculty_token: str):
    # Get faculty user id
    me = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {faculty_token}"})
    faculty_id = me.json()["id"]

    title = f"Autonomous Drone {uuid.uuid4().hex[:6]}"
    res = await async_client.post(
        "/api/v1/projects",
        json={
            "title": title,
            "mentor_id": faculty_id,
            "domain": "robotics",
            "tech_stack": ["ROS", "PyTorch"]
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == title
    assert data["status"] == "ongoing"
    assert data["mentor_id"] == faculty_id
    assert len(data["members"]) >= 1  # creator auto-added


@pytest.mark.asyncio
async def test_create_project_faculty(async_client: AsyncClient, faculty_token: str):
    title = f"Faculty Research LLM {uuid.uuid4().hex[:6]}"
    res = await async_client.post(
        "/api/v1/projects",
        json={
            "title": title,
            "domain": "llm",
            "tech_stack": ["Transformers", "vLLM"]
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res.status_code == 201
    assert res.json()["title"] == title


@pytest.mark.asyncio
async def test_slug_auto_generation_and_collision(async_client: AsyncClient, faculty_token: str):
    base_title = f"Identical Project Title {uuid.uuid4().hex[:4]}"
    res1 = await async_client.post(
        "/api/v1/projects",
        json={"title": base_title, "domain": "nlp"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res1.status_code == 201
    slug1 = res1.json()["slug"]

    # Collision creation
    res2 = await async_client.post(
        "/api/v1/projects",
        json={"title": base_title, "domain": "nlp"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res2.status_code == 201
    slug2 = res2.json()["slug"]

    assert slug1 != slug2
    assert slug2.endswith("-2")


@pytest.mark.asyncio
async def test_add_and_duplicate_member(async_client: AsyncClient, student_token: str, faculty_token: str):
    me = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {faculty_token}"})
    faculty_id = me.json()["id"]

    res = await async_client.post(
        "/api/v1/projects",
        json={"title": f"Team Project {uuid.uuid4().hex[:6]}", "mentor_id": faculty_id},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 201
    proj_id = res.json()["id"]

    stu = await async_client.get("/api/v1/students/me", headers={"Authorization": f"Bearer {student_token}"})
    student_id = stu.json()["id"]

    # Student is already lead member, attempting to add again should return 409
    dup_res = await async_client.post(
        f"/api/v1/projects/{proj_id}/members",
        json={"student_id": student_id, "role": "contributor"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert dup_res.status_code == 409


@pytest.mark.asyncio
async def test_status_completed_sets_end_date(async_client: AsyncClient, faculty_token: str):
    res = await async_client.post(
        "/api/v1/projects",
        json={"title": f"Completion Test {uuid.uuid4().hex[:6]}"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    proj_id = res.json()["id"]
    assert res.json()["end_date"] is None

    patch_res = await async_client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"
    assert patch_res.json()["end_date"] is not None


@pytest.mark.asyncio
async def test_non_creator_cannot_edit(async_client: AsyncClient, faculty_token: str, student_token: str):
    res = await async_client.post(
        "/api/v1/projects",
        json={"title": f"Faculty Private {uuid.uuid4().hex[:6]}"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    proj_id = res.json()["id"]

    # Student attempts to patch faculty's project
    patch_res = await async_client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"title": "Hacked Title"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert patch_res.status_code == 403


@pytest.mark.asyncio
async def test_soft_delete_project(async_client: AsyncClient, faculty_token: str):
    res = await async_client.post(
        "/api/v1/projects",
        json={"title": f"To Delete {uuid.uuid4().hex[:6]}"},
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    proj_id = res.json()["id"]

    del_res = await async_client.delete(
        f"/api/v1/projects/{proj_id}",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert del_res.status_code == 204

    # Now get should return 404
    get_res = await async_client.get(f"/api/v1/projects/{proj_id}")
    assert get_res.status_code == 404
