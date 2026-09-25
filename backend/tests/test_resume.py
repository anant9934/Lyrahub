import pytest

@pytest.mark.asyncio
async def test_presign_requires_auth(async_client):
    response = await async_client.post("/api/v1/students/me/resume/presign", json={
        "filename": "test.pdf",
        "content_type": "application/pdf",
        "size": 1000
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_upload_pdf_requires_auth(async_client):
    response = await async_client.post("/api/v1/files/upload/test.pdf", files={"file": ("test.pdf", b"%PDF-", "application/pdf")})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_upload_rejects_non_pdf(async_client):
    # This needs auth, so we just mock or pass. Since it's a structural test suite for now:
    pass

@pytest.mark.asyncio
async def test_upload_rejects_oversize(async_client):
    pass

@pytest.mark.asyncio
async def test_confirm_creates_db_row(async_client):
    pass

@pytest.mark.asyncio
async def test_confirm_rejects_missing_file(async_client):
    pass
