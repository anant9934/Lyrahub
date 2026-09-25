import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_read_main(async_client: AsyncClient):
    response = await async_client.get("/api/v1/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_ready(async_client: AsyncClient):
    response = await async_client.get("/api/v1/health/ready")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_register_and_login(async_client: AsyncClient):
    # Test user registration
    user_data = {
        "email": f"test_{uuid.uuid4()}@test.com",
        "password": "testpassword123"
    }
    response = await async_client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    assert "id" in response.json()
    assert response.json()["email"] == user_data["email"]

    # Test duplicate registration
    response = await async_client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400

    # Login
    response = await async_client.post(
        "/api/v1/auth/login", 
        data={"username": user_data["email"], "password": user_data["password"]}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    token = response.json()["access_token"]
    
    # Test me
    response = await async_client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == user_data["email"]
