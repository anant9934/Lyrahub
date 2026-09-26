"""
AIDA Gateway — main FastAPI router.

All cloud API calls go through this gateway only.
No other module may call cloud AI providers directly.

Enforcement pipeline (per spec §8):
  request
    → authentication (get_current_user)
    → role resolution
    → AI policy check (cloud_ai_allowed)
    → intent routing (deterministic/local first)
    → quota check (atomic Redis)
    → cloud provider call (if needed & permitted)
    → audit log write
    → response
"""

from __future__ import annotations

import uuid
import time
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text, desc

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.redis import get_redis
from app.core.config import get_settings
from app.core.rbac import get_enforcer
from app.models import User, AIUsageLog
from app.modules.ai.schema import (
    AIDAQueryRequest,
    AIDAQueryResponse,
    AIUsageSummary,
    AIUsageLogEntry,
)
from app.modules.ai import quota as quota_svc
from app.modules.ai import intent_router as intent
from app.modules.ai import provider_router

settings = get_settings()

router = APIRouter()


# ─── Role Resolution ──────────────────────────────────────────────────────────

async def _resolve_role(user: User) -> str:
    """
    Resolve the user's primary role from the server-side RBAC system.
    NEVER trust role from browser.
    """
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["super_admin", "admin", "hod", "cos", "hos", "higher_authority", "faculty", "teacher", "alumni", "student"]:
                if r in [role.lower() for role in roles]:
                    return r
    except Exception:
        pass
    # Default to the most restrictive role
    return "student"


# ─── Main AIDA Query Endpoint ─────────────────────────────────────────────────

@router.post("/query", response_model=AIDAQueryResponse)
async def aida_query(
    body: AIDAQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """
    Primary AIDA query endpoint.
    Students receive deterministic answers or browser SLM signals.
    Authorized staff receive cloud AI when deterministic tools are insufficient.
    """
    request_id = uuid.uuid4().hex[:16]
    role = await _resolve_role(current_user)
    user_id = str(current_user.id)

    # Step 1-6: Deterministic/local routing (always happens first)
    route_result = await intent.route_intent(body.query, db, role)

    # If deterministic answer found, return immediately — no cloud needed
    if route_result.get("answer") is not None:
        return AIDAQueryResponse(
            answer=route_result["answer"],
            source=route_result.get("source"),
            ai_mode=route_result.get("ai_mode", "Deterministic (SQL)"),
            data=route_result.get("data"),
        )

    # Browser SLM signal for students
    if route_result.get("signal") == intent.BROWSER_SLM_SIGNAL:
        return AIDAQueryResponse(
            answer=None,
            source="Browser",
            ai_mode="Browser SLM",
            signal=intent.BROWSER_SLM_SIGNAL,
            query=body.query,
        )

    # Step 7: Cloud LLM — only for authorized staff
    if route_result.get("signal") != intent.CLOUD_REQUIRED_SIGNAL:
        return AIDAQueryResponse(
            answer="I couldn't find an answer to that query.",
            source="None",
            ai_mode="Deterministic (SQL)",
        )

    # Student guard (double-check — defense in depth)
    role_limit = settings.get_role_cloud_limit(role)
    if role_limit == 0:
        return AIDAQueryResponse(
            answer="Advanced AI assistance is restricted to authorized staff roles. Your query requires cloud AI which is not available for students.",
            source="Policy",
            ai_mode="Blocked",
            cloud_calls_used=0,
            cloud_calls_limit=0,
        )

    # Quota check (atomic)
    allowed, deny_reason, quota_before, quota_after = await quota_svc.check_and_consume_quota(
        redis, user_id, role
    )

    if not allowed:
        return AIDAQueryResponse(
            answer=deny_reason,
            source="Quota Policy",
            ai_mode="Quota Exceeded",
            cloud_calls_used=quota_before,
            cloud_calls_limit=role_limit,
        )

    # Cloud provider call
    start = time.monotonic()
    success = False
    provider_result = {}
    error_msg = None

    try:
        system_prompt = (
            "You are AIDA, the intelligent assistant for the AI & ML Department at Lyrahub. "
            "You help faculty, HODs, and administrators with complex departmental queries. "
            "Be concise, data-driven, and professional. Do not fabricate data."
        )
        provider_result = await provider_router.route_to_cloud(body.query, system_prompt)
        success = True
    except RuntimeError as e:
        error_msg = str(e)
        # Roll back quota if all providers failed
        await quota_svc.rollback_quota(redis, user_id)
        # Update quota_after back
        quota_after = quota_before

    latency_ms = int((time.monotonic() - start) * 1000)

    # Audit log (always write, even on failure)
    today_ist = quota_svc._today_ist()
    try:
        log = AIUsageLog(
            user_id=current_user.id,
            role=role,
            usage_date=date.fromisoformat(today_ist),
            provider=provider_result.get("provider", "unknown"),
            model=provider_result.get("model"),
            request_id=request_id,
            tokens_in=provider_result.get("tokens_in"),
            tokens_out=provider_result.get("tokens_out"),
            latency_ms=latency_ms,
            success=success,
            reason_for_cloud_route="Complex query requiring LLM reasoning beyond deterministic tools",
            quota_before=quota_before,
            quota_after=quota_after,
            error_message=error_msg,
        )
        db.add(log)
        await db.commit()
    except Exception:
        await db.rollback()

    if not success:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cloud AI temporarily unavailable. {error_msg}",
        )

    current_usage = await quota_svc.get_user_usage(redis, user_id)

    return AIDAQueryResponse(
        answer=provider_result.get("text"),
        source="Department database + Cloud AI",
        ai_mode="Cloud LLM",
        cloud_calls_used=current_usage,
        cloud_calls_limit=role_limit,
        provider=provider_result.get("provider"),
        tokens_in=provider_result.get("tokens_in"),
        tokens_out=provider_result.get("tokens_out"),
        latency_ms=latency_ms,
    )


# ─── Quota Status Endpoint ────────────────────────────────────────────────────

@router.get("/quota")
async def get_my_quota(
    current_user: User = Depends(get_current_active_user),
    redis=Depends(get_redis),
):
    """Returns the current user's cloud AI quota status."""
    role = await _resolve_role(current_user)
    user_id = str(current_user.id)
    role_limit = settings.get_role_cloud_limit(role)
    used = await quota_svc.get_user_usage(redis, user_id) if role_limit > 0 else 0

    return {
        "role": role,
        "cloud_ai_allowed": role_limit > 0 and settings.CLOUD_AI_ENABLED,
        "cloud_calls_limit": role_limit,
        "cloud_calls_used": used,
        "cloud_calls_remaining": max(0, role_limit - used),
        "reset_time": "00:00 Asia/Kolkata",
    }


# ─── Admin AI Usage Dashboard ─────────────────────────────────────────────────

async def _require_admin(user: User) -> str:
    role = await _resolve_role(user)
    if role not in ["admin", "super_admin", "hod"]:
        raise HTTPException(status_code=403, detail="Admin or HOD access required for AI usage dashboard.")
    return role


@router.get("/admin/usage", response_model=AIUsageSummary)
async def get_ai_usage_summary(
    target_date: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """
    Returns today's cloud AI usage summary for the admin dashboard.
    Only accessible to Admin and HOD roles.
    """
    await _require_admin(current_user)

    today_str = target_date or quota_svc._today_ist()
    try:
        target_date_obj = date.fromisoformat(today_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Query from DB for today's logs
    stmt = select(AIUsageLog).where(AIUsageLog.usage_date == target_date_obj)
    result = await db.execute(stmt)
    logs = result.scalars().all()

    # Aggregate
    by_role: dict[str, int] = {}
    by_provider: dict[str, int] = {}
    total_tokens_in = 0
    total_tokens_out = 0
    total_latency = 0
    failed = 0
    successful_count = 0

    for log in logs:
        by_role[log.role] = by_role.get(log.role, 0) + 1
        by_provider[log.provider] = by_provider.get(log.provider, 0) + 1
        if log.tokens_in:
            total_tokens_in += log.tokens_in
        if log.tokens_out:
            total_tokens_out += log.tokens_out
        if log.latency_ms:
            total_latency += log.latency_ms
        if not log.success:
            failed += 1
        else:
            successful_count += 1

    total_calls = len(logs)
    avg_latency = (total_latency / successful_count) if successful_count > 0 else None

    # Redis for live global counters
    global_daily = await quota_svc.get_global_usage_today(redis)
    global_monthly = await quota_svc.get_global_usage_month(redis)

    return AIUsageSummary(
        date=today_str,
        total_cloud_calls=total_calls,
        global_daily_limit=settings.CLOUD_AI_GLOBAL_DAILY_LIMIT,
        global_monthly_limit=settings.CLOUD_AI_GLOBAL_MONTHLY_LIMIT,
        monthly_calls_used=global_monthly,
        by_role=by_role,
        by_provider=by_provider,
        failed_requests=failed,
        avg_latency_ms=round(avg_latency, 1) if avg_latency else None,
        total_tokens_in=total_tokens_in,
        total_tokens_out=total_tokens_out,
    )


@router.get("/admin/usage/logs")
async def list_usage_logs(
    page: int = 1,
    limit: int = 50,
    role: Optional[str] = None,
    provider: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns paginated cloud AI usage audit logs. Admin/HOD only."""
    await _require_admin(current_user)
    limit = min(limit, 100)
    offset = (page - 1) * limit

    stmt = select(AIUsageLog).order_by(desc(AIUsageLog.created_at))
    if role:
        stmt = stmt.where(AIUsageLog.role == role)
    if provider:
        stmt = stmt.where(AIUsageLog.provider == provider)
    stmt = stmt.offset(offset).limit(limit)

    result = await db.execute(stmt)
    logs = result.scalars().all()

    return {
        "page": page,
        "limit": limit,
        "logs": [
            AIUsageLogEntry(
                id=str(log.id),
                user_id=str(log.user_id) if log.user_id else None,
                role=log.role,
                usage_date=str(log.usage_date),
                provider=log.provider,
                model=log.model,
                tokens_in=log.tokens_in,
                tokens_out=log.tokens_out,
                latency_ms=log.latency_ms,
                success=log.success,
                reason_for_cloud_route=log.reason_for_cloud_route,
                quota_before=log.quota_before,
                quota_after=log.quota_after,
                created_at=log.created_at.isoformat() if log.created_at else None,
            )
            for log in logs
        ],
    }


@router.get("/admin/policy")
async def get_ai_policy(
    current_user: User = Depends(get_current_active_user),
):
    """Returns the current AI gateway policy configuration. Admin/HOD only."""
    await _require_admin(current_user)
    return {
        "cloud_ai_enabled": settings.CLOUD_AI_ENABLED,
        "limits_per_role": {
            "student": settings.STUDENT_CLOUD_CALLS_PER_DAY,
            "faculty": settings.FACULTY_CLOUD_CALLS_PER_DAY,
            "hod": settings.HOD_CLOUD_CALLS_PER_DAY,
            "cos": settings.COS_CLOUD_CALLS_PER_DAY,
            "hos": settings.HOS_CLOUD_CALLS_PER_DAY,
            "higher_authority": settings.HIGHER_AUTHORITY_CLOUD_CALLS_PER_DAY,
            "super_admin": settings.SUPER_ADMIN_CLOUD_CALLS_PER_DAY,
        },
        "global_daily_limit": settings.CLOUD_AI_GLOBAL_DAILY_LIMIT,
        "global_monthly_limit": settings.CLOUD_AI_GLOBAL_MONTHLY_LIMIT,
        "max_tokens_per_request": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
        "provider_order": settings.CLOUD_AI_PROVIDER_ORDER.split(","),
        "reset_time": "00:00 Asia/Kolkata",
    }
