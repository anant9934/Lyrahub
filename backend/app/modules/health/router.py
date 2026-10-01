import asyncio
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.database import get_db
from app.core.telemetry import warm_tracker
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter()

@router.get("/live")
async def live(response: Response = Response()):
    """Liveness probe: verifies the web process is running."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return {"status": "ok"}

@router.get("/ready")
async def ready(response: Response = Response(), db: AsyncSession = Depends(get_db)):
    """Readiness probe: verifies DB connectivity with bounded timeout."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

    t0 = time.time()
    try:
        await asyncio.wait_for(db.execute(select(1)), timeout=4.0)
        dur_ms = (time.time() - t0) * 1000
        warm_tracker.record_success(dur_ms)
        db_status = "ok"
    except Exception as e:
        dur_ms = (time.time() - t0) * 1000
        warm_tracker.record_failure(str(e))
        db_status = f"error: {str(e)[:50]}"

    if db_status != "ok":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not ready", "checks": {"db": db_status}}
        )

    return {
        "status": "ready",
        "checks": {"db": db_status},
        "latency_ms": round(dur_ms, 2)
    }

@router.get("/warm")
async def warm(response: Response = Response(), db: AsyncSession = Depends(get_db)):
    """Dedicated Keep-Alive / Anti-Idle endpoint for scheduled workers.
    Performs minimal-cost DB ping (SELECT 1) to keep the pool and Neon active.
    """
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

    t0 = time.time()
    try:
        await asyncio.wait_for(db.execute(select(1)), timeout=4.0)
        dur_ms = (time.time() - t0) * 1000
        warm_tracker.record_success(dur_ms)
        return {
            "status": "warm",
            "db": "ok",
            "latency_ms": round(dur_ms, 2),
            "telemetry": warm_tracker.get_status()
        }
    except Exception as e:
        dur_ms = (time.time() - t0) * 1000
        warm_tracker.record_failure(str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "warm_failed", "error": str(e)[:100]}
        )


@router.get("/status")
async def health_status(response: Response = Response()):
    """Lightweight operational telemetry on warm state."""
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return warm_tracker.get_status()



