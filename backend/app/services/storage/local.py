import os
import aiofiles
from typing import Optional
from .base import StorageProvider
from fastapi import HTTPException

class LocalStorageProvider(StorageProvider):
    def __init__(self):
        self.root_dir = os.path.join(os.getcwd(), "uploads")
        os.makedirs(self.root_dir, exist_ok=True)
    
    def _get_absolute_path(self, key: str) -> str:
        if ".." in key or key.startswith("/"):
            raise HTTPException(status_code=400, detail="Invalid file key (path traversal detected)")
        return os.path.join(self.root_dir, key)

    async def generate_upload_url(
        self, key: str, content_type: str, expires: int = 900
    ) -> str:
        # Validate key up front
        self._get_absolute_path(key)
        return f"/api/v1/files/upload/{key}"

    async def file_exists(self, key: str) -> bool:
        path = self._get_absolute_path(key)
        return os.path.isfile(path)

    async def get_file_bytes(self, key: str) -> bytes:
        path = self._get_absolute_path(key)
        if not os.path.isfile(path):
            raise FileNotFoundError(f"File {key} not found")
        async with aiofiles.open(path, "rb") as f:
            return await f.read()

    async def get_download_url(
        self, key: str, expires: int = 900
    ) -> str:
        self._get_absolute_path(key)
        return f"/api/v1/files/download/{key}"

    async def delete_file(self, key: str) -> bool:
        path = self._get_absolute_path(key)
        if os.path.isfile(path):
            os.remove(path)
            return True
        return False
