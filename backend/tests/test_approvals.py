import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_approvals_workflow_integration(
    async_client: AsyncClient,
    faculty_token: str,
    hod_token: str
):
    # 1. Faculty submits a change request directly via approvals endpoint
    req_res = await async_client.post(
        "/api/v1/approvals/requests",
        json={
            "resource_type": "achievement",
            "action": "create",
            "payload": {
                "title": f"Integration Award {uuid.uuid4().hex[:6]}",
                "badge_name": "Gold Medalist"
            }
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert req_res.status_code == 201
    cr_data = req_res.json()
    cr_id = cr_data["id"]
    assert cr_data["status"] == "pending"

    # 2. Cannot approve own request if reviewer is requester
    self_app = await async_client.post(
        f"/api/v1/approvals/requests/{cr_id}/approve",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert self_app.status_code in [400, 403]

    # 3. HOD views pending requests
    pending_res = await async_client.get(
        "/api/v1/approvals/requests?status=pending",
        headers={"Authorization": f"Bearer {hod_token}"}
    )
    assert pending_res.status_code == 200
    assert any(item["id"] == cr_id for item in pending_res.json()["items"])

    # 4. HOD approves change request
    app_res = await async_client.post(
        f"/api/v1/approvals/requests/{cr_id}/approve",
        headers={"Authorization": f"Bearer {hod_token}"}
    )
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "approved"

@pytest.mark.asyncio
async def test_approvals_rejection_and_withdraw(
    async_client: AsyncClient,
    faculty_token: str,
    hod_token: str
):
    # 1. Faculty submits change request
    req1 = await async_client.post(
        "/api/v1/approvals/requests",
        json={
            "resource_type": "test",
            "action": "create",
            "payload": {"title": "Reject Me Test"}
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert req1.status_code == 201
    cr1_id = req1.json()["id"]

    # 2. HOD rejects with comment
    rej_res = await async_client.post(
        f"/api/v1/approvals/requests/{cr1_id}/reject",
        json={"comment": "Insufficient questions for test approval"},
        headers={"Authorization": f"Bearer {hod_token}"}
    )
    assert rej_res.status_code == 200
    assert rej_res.json()["status"] == "rejected"
    assert rej_res.json()["reviewer_comment"] == "Insufficient questions for test approval"

    # 3. Faculty submits another and withdraws
    req2 = await async_client.post(
        "/api/v1/approvals/requests",
        json={
            "resource_type": "test",
            "action": "create",
            "payload": {"title": "Withdraw Me"}
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert req2.status_code == 201
    cr2_id = req2.json()["id"]

    wd_res = await async_client.post(
        f"/api/v1/approvals/requests/{cr2_id}/withdraw",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert wd_res.status_code == 200
    assert wd_res.json()["status"] == "withdrawn"
