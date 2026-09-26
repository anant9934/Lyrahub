import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_student_qr_generation(async_client: AsyncClient, student_token: str):
    res = await async_client.get(
        "/api/v1/qr/student/me",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/png"
    assert res.content.startswith(b"\x89PNG\r\n\x1a\n")

@pytest.mark.asyncio
async def test_attendance_session_and_marking(
    async_client: AsyncClient,
    faculty_token: str,
    student_token: str
):
    # 1. Faculty creates attendance session
    sess_res = await async_client.post(
        "/api/v1/qr/attendance/session",
        json={
            "section": "AIML-Batch-A",
            "duration_minutes": 20
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert sess_res.status_code == 201
    sess_data = sess_res.json()
    session_id = sess_data["id"]
    assert sess_data["is_active"] is True
    assert sess_data["qr_image_base64"].startswith("data:image/png;base64,")

    # 2. Student marks attendance
    mark_res = await async_client.post(
        "/api/v1/qr/attendance/mark",
        json={"session_id": session_id},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert mark_res.status_code == 201
    assert "Attendance marked successfully" in mark_res.json()["message"]

    # 3. Duplicate mark returns 409
    dup_res = await async_client.post(
        "/api/v1/qr/attendance/mark",
        json={"session_id": session_id},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert dup_res.status_code == 409

    # 4. Faculty views session records
    rec_res = await async_client.get(
        f"/api/v1/qr/attendance/session/{session_id}/records",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert rec_res.status_code == 200
    records = rec_res.json()
    assert records["total_marked"] >= 1
