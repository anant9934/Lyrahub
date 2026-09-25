import pytest
import os
from httpx import AsyncClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))


@pytest.fixture
async def async_client():
    async with AsyncClient(base_url="http://127.0.0.1:8000", timeout=30.0) as ac:
        yield ac


async def _get_token(async_client: AsyncClient, email: str, password: str) -> str:
    res = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
async def student_token(async_client: AsyncClient) -> str:
    return await _get_token(async_client, "student@aiml.hub", "password123")


@pytest.fixture
async def faculty_token(async_client: AsyncClient) -> str:
    return await _get_token(async_client, "admin@aiml.hub", "admin123")


@pytest.fixture
async def hod_token(async_client: AsyncClient) -> str:
    return await _get_token(async_client, "hod@aiml.hub", "hod123")
