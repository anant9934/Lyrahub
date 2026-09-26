"""
Quota Service — enforces role-based cloud AI daily limits using atomic Redis counters.

Architecture:
  request → auth → role resolution → quota check → ... → cloud call → increment

Daily quotas reset at 00:00 Asia/Kolkata.
Redis key format: ai:cloud:{user_id}:{YYYY-MM-DD_IST}
Global key format: ai:cloud:global:{YYYY-MM-DD_IST}
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Tuple

import redis.asyncio as aioredis

from app.core.config import get_settings

settings = get_settings()

# IST = UTC+5:30
IST_OFFSET = timedelta(hours=5, minutes=30)


def _today_ist() -> str:
    """Returns today's date string in IST timezone (YYYY-MM-DD)."""
    now_ist = datetime.now(timezone.utc) + IST_OFFSET
    return now_ist.strftime("%Y-%m-%d")


def _user_key(user_id: str) -> str:
    return f"ai:cloud:{user_id}:{_today_ist()}"


def _global_key() -> str:
    return f"ai:cloud:global:{_today_ist()}"


def _monthly_key() -> str:
    now_ist = datetime.now(timezone.utc) + IST_OFFSET
    return f"ai:cloud:global:monthly:{now_ist.strftime('%Y-%m')}"


# TTL for keys: 25 hours to survive midnight reset
_KEY_TTL_SECONDS = 25 * 60 * 60


async def get_user_usage(redis: aioredis.Redis, user_id: str) -> int:
    """Return how many cloud calls the user has made today (IST)."""
    val = await redis.get(_user_key(user_id))
    return int(val) if val else 0


async def get_global_usage_today(redis: aioredis.Redis) -> int:
    val = await redis.get(_global_key())
    return int(val) if val else 0


async def get_global_usage_month(redis: aioredis.Redis) -> int:
    val = await redis.get(_monthly_key())
    return int(val) if val else 0


async def check_and_consume_quota(
    redis: aioredis.Redis,
    user_id: str,
    role: str,
) -> Tuple[bool, str, int, int]:
    """
    Atomically check and increment the user's daily cloud call counter.

    Returns:
        (allowed, reason_denied, quota_before, quota_after)

    The increment is rolled back if any limit is violated.
    """
    # 1. Kill switch
    if not settings.CLOUD_AI_ENABLED:
        return False, "Cloud AI is disabled by administrator (CLOUD_AI_ENABLED=false)", 0, 0

    role_limit = settings.get_role_cloud_limit(role)

    # 2. Students always denied
    if role_limit == 0:
        return False, "Cloud AI is not available for your role. Advanced AI assistance is restricted to authorized staff roles.", 0, 0

    user_key = _user_key(user_id)
    global_key = _global_key()
    monthly_key = _monthly_key()

    # 3. Atomic increment via pipeline
    async with redis.pipeline(transaction=True) as pipe:
        try:
            await pipe.watch(user_key, global_key)
            current_user = int(await redis.get(user_key) or 0)
            current_global = int(await redis.get(global_key) or 0)
            current_monthly = int(await redis.get(monthly_key) or 0)

            # Check before incrementing
            if current_user >= role_limit:
                return False, f"Daily cloud AI quota exhausted ({current_user}/{role_limit} calls used).", current_user, current_user

            if current_global >= settings.CLOUD_AI_GLOBAL_DAILY_LIMIT:
                return False, f"Global daily cloud AI budget exhausted ({current_global}/{settings.CLOUD_AI_GLOBAL_DAILY_LIMIT} calls).", current_user, current_user

            if current_monthly >= settings.CLOUD_AI_GLOBAL_MONTHLY_LIMIT:
                return False, f"Global monthly cloud AI budget exhausted ({current_monthly}/{settings.CLOUD_AI_GLOBAL_MONTHLY_LIMIT} calls).", current_user, current_user

            pipe.multi()
            pipe.incr(user_key)
            pipe.expire(user_key, _KEY_TTL_SECONDS)
            pipe.incr(global_key)
            pipe.expire(global_key, _KEY_TTL_SECONDS)
            pipe.incr(monthly_key)
            pipe.expire(monthly_key, 32 * 24 * 60 * 60)  # 32 days
            results = await pipe.execute()
            new_user_count = results[0]

            return True, "", current_user, new_user_count
        except aioredis.WatchError:
            # Retry once on concurrent modification
            current_user_retry = int(await redis.get(user_key) or 0)
            if current_user_retry >= role_limit:
                return False, f"Daily cloud AI quota exhausted (concurrent request conflict).", current_user_retry, current_user_retry
            return False, "Quota check failed due to concurrent request. Please retry.", current_user_retry, current_user_retry


async def rollback_quota(redis: aioredis.Redis, user_id: str) -> None:
    """Decrement counters if a provider call ultimately failed after quota was consumed."""
    user_key = _user_key(user_id)
    global_key = _global_key()
    monthly_key = _monthly_key()
    # Clamp to 0
    current = int(await redis.get(user_key) or 0)
    if current > 0:
        await redis.decr(user_key)
    current_g = int(await redis.get(global_key) or 0)
    if current_g > 0:
        await redis.decr(global_key)
    current_m = int(await redis.get(monthly_key) or 0)
    if current_m > 0:
        await redis.decr(monthly_key)
