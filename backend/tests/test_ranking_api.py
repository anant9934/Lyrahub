import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.dependencies import get_current_active_user
from app.modules.ranking.router import require_hod

@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

async def mock_active_user():
    return {"id": "mock-user-id", "email": "test@example.com"}

async def mock_require_hod():
    return True

async def mock_require_hod_fail():
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="HOD role required")

@pytest.mark.asyncio
async def test_get_ranking_unauthorized(async_client: AsyncClient):
    app.dependency_overrides = {}
    response = await async_client.get("/api/v1/ranking")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_ranking_authorized(async_client: AsyncClient):
    app.dependency_overrides[get_current_active_user] = mock_active_user
    response = await async_client.get("/api/v1/ranking")
    assert response.status_code == 200
    assert "items" in response.json()

@pytest.mark.asyncio
async def test_post_recalculate_faculty(async_client: AsyncClient):
    app.dependency_overrides[get_current_active_user] = mock_active_user
    app.dependency_overrides[require_hod] = mock_require_hod_fail
    response = await async_client.post("/api/v1/ranking/recalculate")
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_post_recalculate_hod(async_client: AsyncClient):
    from app.core.database import get_db
    from unittest.mock import AsyncMock
    mock_session = AsyncMock()
    async def override_get_db():
        yield mock_session

    app.dependency_overrides[get_current_active_user] = mock_active_user
    app.dependency_overrides[require_hod] = mock_require_hod
    app.dependency_overrides[get_db] = override_get_db
    response = await async_client.post("/api/v1/ranking/recalculate")
    assert response.status_code == 202

@pytest.mark.asyncio
async def test_put_config_hod_invalid(async_client: AsyncClient):
    app.dependency_overrides[get_current_active_user] = mock_active_user
    app.dependency_overrides[require_hod] = mock_require_hod
    payload = {
        "weights": {
            "test_score": 0.5,
            "cgpa": 0.5,
            "certifications": 0.5
        }
    }
    response = await async_client.put("/api/v1/ranking/config", json=payload)
    assert response.status_code == 400
    assert "sum" in response.json()["detail"]

@pytest.mark.asyncio
async def test_put_config_faculty(async_client: AsyncClient):
    app.dependency_overrides[get_current_active_user] = mock_active_user
    app.dependency_overrides[require_hod] = mock_require_hod_fail
    payload = {
        "weights": {
            "test_score": 0.25,
            "cgpa": 0.15,
            "certifications": 0.15,
            "projects": 0.15,
            "coding_stats": 0.10,
            "resume_quality": 0.10,
            "internships": 0.05,
            "revenue": 0.05
        }
    }
    response = await async_client.put("/api/v1/ranking/config", json=payload)
    assert response.status_code == 403
