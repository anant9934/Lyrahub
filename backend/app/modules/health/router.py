from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
import redis.asyncio as redis
from app.core.redis import get_redis
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter()

@router.get("/live")
async def live(response: Response = Response()):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return {"status": "ok"}

@router.get("/ready")
async def ready(response: Response = Response(), db: AsyncSession = Depends(get_db), redis_client: redis.Redis = Depends(get_redis)):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"


    try:
        await db.execute(select(1))
        db_status = "ok"
    except Exception:
        db_status = "error"
        
    try:
        await redis_client.ping()
        redis_status = "ok"
    except Exception:
        redis_status = "error"
        
    if db_status != "ok" or redis_status != "ok":
        raise HTTPException(status_code=503, detail={"status": "not ready", "checks": {"db": db_status, "redis": redis_status}})
        
    return {"status": "ready", "checks": {"db": db_status, "redis": redis_status}}

