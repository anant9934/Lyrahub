from abc import ABC, abstractmethod

class StorageProvider(ABC):
    @abstractmethod
    async def generate_upload_url(
        self, key: str, content_type: str, expires: int = 900
    ) -> str:
        """Return a URL the client can PUT/POST the file to."""
        pass

    @abstractmethod
    async def file_exists(self, key: str) -> bool:
        """Check if a file exists at the given key."""
        pass

    @abstractmethod
    async def get_file_bytes(self, key: str) -> bytes:
        """Read file bytes (used for parsing)."""
        pass

    @abstractmethod
    async def get_download_url(
        self, key: str, expires: int = 900
    ) -> str:
        """Return a URL to download the file."""
        pass

    @abstractmethod
    async def delete_file(self, key: str) -> bool:
        """Delete the file."""
        pass
