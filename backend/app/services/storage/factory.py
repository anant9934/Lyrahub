import os
from .base import StorageProvider
from .local import LocalStorageProvider
from .r2 import R2StorageProvider

def get_storage() -> StorageProvider:
    provider = os.getenv("STORAGE_PROVIDER", "local")
    if provider == "local":
        return LocalStorageProvider()
    elif provider == "r2":
        return R2StorageProvider()
    else:
        raise ValueError(f"Unknown STORAGE_PROVIDER: {provider}")
