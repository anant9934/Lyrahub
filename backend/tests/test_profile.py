import pytest

@pytest.mark.asyncio
async def test_get_profile_authenticated(async_client):
    pass

@pytest.mark.asyncio
async def test_get_profile_unauthenticated(async_client):
    response = await async_client.get("/api/v1/students/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_patch_profile_creates_history(async_client):
    pass

@pytest.mark.asyncio
async def test_get_history(async_client):
    pass
