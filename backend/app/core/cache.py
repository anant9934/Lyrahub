import time
from typing import Any, Optional, Dict, Tuple

class InMemoryTTLCache:
    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self._store: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        expires_at, val = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            return None
        return val

    def set(self, key: str, val: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        self._store[key] = (time.time() + duration, val)

    def invalidate(self, prefix: str = "") -> None:
        if not prefix:
            self._store.clear()
            return
        keys_to_del = [k for k in self._store.keys() if k.startswith(prefix)]
        for k in keys_to_del:
            del self._store[k]

# Global cache instance for public endpoints
catalog_cache = InMemoryTTLCache(default_ttl=300)  # 5 minutes
