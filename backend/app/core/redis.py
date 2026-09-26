import redis.asyncio as redis
from app.core.config import get_settings

settings = get_settings()

redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client
