import pytest
import os
from unittest.mock import patch
from fastapi import HTTPException
from app.services.storage.local import LocalStorageProvider
from app.services.storage.factory import get_storage
from app.services.storage.r2 import R2StorageProvider

@pytest.mark.asyncio
async def test_local_upload_and_read():
    provider = LocalStorageProvider()
    key = "test/file.pdf"
    content = b"%PDF-test"
    url = await provider.generate_upload_url(key, "application/pdf")
    assert "/api/v1/files/upload/test/file.pdf" in url
    
    os.makedirs(os.path.dirname(provider._get_absolute_path(key)), exist_ok=True)
    with open(provider._get_absolute_path(key), "wb") as f:
        f.write(content)
        
    assert await provider.file_exists(key) is True
    read_content = await provider.get_file_bytes(key)
    assert read_content == content
    await provider.delete_file(key)

@pytest.mark.asyncio
async def test_local_delete():
    provider = LocalStorageProvider()
    key = "test/delete.pdf"
    os.makedirs(os.path.dirname(provider._get_absolute_path(key)), exist_ok=True)
    with open(provider._get_absolute_path(key), "wb") as f:
        f.write(b"data")
    assert await provider.delete_file(key) is True
    assert await provider.file_exists(key) is False

@pytest.mark.asyncio
async def test_path_traversal_rejected():
    provider = LocalStorageProvider()
    with pytest.raises(HTTPException) as exc:
        provider._get_absolute_path("../etc/passwd")
    assert exc.value.status_code == 400
    
    with pytest.raises(HTTPException) as exc:
        provider._get_absolute_path("/etc/passwd")
    assert exc.value.status_code == 400

def test_factory_returns_local_by_default():
    if "STORAGE_PROVIDER" in os.environ:
        del os.environ["STORAGE_PROVIDER"]
    provider = get_storage()
    assert isinstance(provider, LocalStorageProvider)

@patch("boto3.client")
def test_factory_returns_r2_when_env_set(mock_boto3):
    os.environ["STORAGE_PROVIDER"] = "r2"
    os.environ["R2_ACCOUNT_ID"] = "test"
    os.environ["R2_ACCESS_KEY"] = "test"
    os.environ["R2_SECRET_KEY"] = "test"
    os.environ["R2_BUCKET"] = "test"
    provider = get_storage()
    assert isinstance(provider, R2StorageProvider)
    os.environ["STORAGE_PROVIDER"] = "local"
