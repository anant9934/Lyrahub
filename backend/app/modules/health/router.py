import asyncio
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
async def ready(response: Response = Response(), db: AsyncSession = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

    # Fast bounded check for DB connection
    try:
        await asyncio.wait_for(db.execute(select(1)), timeout=1.5)
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"

    if db_status != "ok":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not ready", "checks": {"db": db_status}}
        )

    return {"status": "ready", "checks": {"db": db_status}}


