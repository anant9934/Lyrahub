"""
AIDA Gateway — upgraded main FastAPI router (Phase 5).

Routing pipeline (7 levels):
  request
    → authentication (get_current_user)
    → role resolution (server-side RBAC)
    → cache check (Redis)
    → 7-level intent router
      → deterministic tools
      → OKF knowledge
      → RAG retrieval
      → local LLM (Ollama)
      → cloud policy check
      → quota check (atomic Redis)
      → cloud provider call
    → audit log
    → response

Cloud is LAST. Students NEVER get cloud.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import uuid
import time
from datetime import date, datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text, desc

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.redis import get_redis
from app.core.config import get_settings
from app.core.rbac import get_enforcer
from app.models import User, AIUsageLog, AIModelHealth, KnowledgeDocument
from app.modules.ai.schema import (
    AIDAQueryRequest,
    AIDAQueryResponse,
    AIUsageSummary,
    AIUsageLogEntry,
)
from app.modules.ai import quota as quota_svc
from app.modules.ai import intent_router as intent
from app.modules.ai import provider_router
from app.modules.ai import rag_service
from app.modules.ai.okf_engine import get_okf_engine
from app.modules.ai.providers.ollama_provider import get_ollama_provider
from app.modules.ai.model_registry import get_registry, ModelType

settings = get_settings()

router = APIRouter()

# Single-flight request coalescing (Phase 12)
_in_flight_coalescing: Dict[str, asyncio.Future] = {}
_coalescing_lock = asyncio.Lock()

# Cache TTL constants (seconds)
_CACHE_TTL_ANALYTICS = 5 * 60         # 5 min — simple analytics
_CACHE_TTL_KNOWLEDGE = 24 * 60 * 60   # 1 day — public knowledge
_CACHE_TTL_GENERATED = 60 * 60        # 1 hour — LLM responses


# ─── Role Resolution ──────────────────────────────────────────────────────────

async def _resolve_role(user: User) -> str:
    """Resolve the user's primary role from server-side RBAC. NEVER trust browser."""
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["super_admin", "admin", "hod", "cos", "hos", "higher_authority", "faculty", "teacher", "alumni", "student"]:
                if r in [role.lower() for role in roles]:
                    return r
    except Exception:
        pass
    return "student"


# ─── Security: Prompt Injection Defense (Rules 56 & 57) ──────────────────────
import re

_PROMPT_INJECTION_RE = re.compile(
    r"(ignore\s+(all\s+)?(previous|prior)\s+(instructions|directives|rules)|"
    r"disregard\s+(all\s+)?(previous|prior)\s+(instructions|rules)|"
    r"(?:what\s+is|show|print|reveal|repeat|output)\s+(?:me\s+)?(?:your\s+|the\s+)?(?:system|developer|hidden|initial)?\s*(?:prompt|instructions|directives|rules|api\s+keys|credentials)|"
    r"(?:print|reveal|show|output)\s+(?:all\s+)?(?:the\s+)?(?:hidden|internal|developer)\s+(?:message|instructions|configuration|tools|apis)|"
    r"repeat\s+(?:all\s+)?(?:the\s+)?(?:words|text|instructions)|"
    r"you\s+are\s+now\s+in\s+developer\s+mode|"
    r"dan\s+mode|jailbreak|"
    r"act\s+as\s+(a\s+)?super_?admin|"
    r"bypass\s+(all\s+)?authorization|"
    r"drop\s+table|delete\s+from\s+users|truncate\s+table)",
    re.IGNORECASE,
)

def _detect_prompt_injection(query: str) -> bool:
    """Detects overt attempts to override system instructions or inject destructive SQL."""
    return bool(_PROMPT_INJECTION_RE.search(query))


# ─── Cache (Zero-Trust Isolated) ───────────────────────────────────────────────

def _cache_key(user_id: str, query: str, role: str, mode: str) -> str:
    """Scope-aware cache key strictly bound to user_id, role, and query hash to prevent cross-user leakage."""
    q_lower = query.lower().strip()
    scope = f"{user_id}:{role}:{mode}"
    scope_hash = hashlib.sha256(scope.encode()).hexdigest()[:12]
    query_hash = hashlib.sha256(q_lower.encode()).hexdigest()[:16]
    return f"aida:{scope_hash}:{query_hash}"


async def _get_cache(redis, key: str) -> Optional[dict]:
    try:
        val = await redis.get(key)
        if val:
            return json.loads(val)
    except Exception:
        pass
    return None


async def _set_cache(redis, key: str, value: dict, ttl: int) -> None:
    try:
        await redis.set(key, json.dumps(value), ex=ttl)
    except Exception:
        pass


def _get_cache_ttl(route: str) -> int:
    if route == "deterministic":
        return _CACHE_TTL_ANALYTICS
    if route in ("okf", "knowledge"):
        return _CACHE_TTL_KNOWLEDGE
    return _CACHE_TTL_GENERATED


# ─── Main AIDA Query Endpoint ─────────────────────────────────────────────────

@router.post("/query", response_model=AIDAQueryResponse)
async def aida_query(
    body: AIDAQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """
    Primary AIDA query endpoint — 7-level hybrid routing.

    Level 0-2: Deterministic SQL (always first)
    Level 3: Browser SLM signal (for students without local match)
    Level 4: OKF knowledge retrieval
    Level 5: RAG / pgvector retrieval
    Level 6: Local LLM (Ollama)
    Level 7: Cloud LLM (authorized staff, quota enforced)
    """
    request_id = uuid.uuid4().hex[:16]
    role = await _resolve_role(current_user)
    user_id = str(current_user.id)
    mode = getattr(body, "mode", "hybrid") or "hybrid"

    # ── Prompt Injection & Adversarial Filter (Rules 56 & 57) ─────────────────
    if _detect_prompt_injection(body.query):
        return AIDAQueryResponse(
            request_id=request_id,
            answer="I cannot fulfill requests attempting to alter system instructions, security boundaries, or administrative policies. Institutional inquiries must follow authorized protocols.",
            source="security_barrier",
            route="security_refusal",
            intent="adversarial_attempt",
            ai_mode="Security Barrier (Policy Enforced)",
            metadata={"security_flag": True},
        )

    # ── Cache check (Level 1) ─────────────────────────────────────────────────
    cache_key = _cache_key(user_id, body.query, role, mode)
    cached = await _get_cache(redis, cache_key)
    if cached:
        return AIDAQueryResponse(
            request_id=request_id,
            answer=cached.get("answer"),
            source=cached.get("source"),
            route=cached.get("route", "cache"),
            intent=cached.get("intent"),
            ai_mode=f"Cache ({cached.get('route', 'cached')})",
            data=cached.get("data"),
            sources=cached.get("sources"),
            metadata={"cached": True, "data_as_of": cached.get("data_as_of", "")},
        )

    # ── Request Coalescing (Phase 12: Single-flight deduplication) ────────────
    leader_fut = None
    my_fut = None
    async with _coalescing_lock:
        if cache_key in _in_flight_coalescing:
            leader_fut = _in_flight_coalescing[cache_key]
        else:
            my_fut = asyncio.get_running_loop().create_future()
            _in_flight_coalescing[cache_key] = my_fut

    if leader_fut is not None:
        try:
            coalesced = await asyncio.wait_for(asyncio.shield(leader_fut), timeout=10.0)
            if coalesced:
                return AIDAQueryResponse(
                    request_id=request_id,
                    answer=coalesced.get("answer"),
                    source=coalesced.get("source"),
                    route=coalesced.get("route", "coalesced"),
                    intent=coalesced.get("intent"),
                    ai_mode=f"Coalesced ({coalesced.get('route', 'cached')})",
                    data=coalesced.get("data"),
                    sources=coalesced.get("sources"),
                    latency_ms=coalesced.get("latency_ms", 5),
                    metadata={"cached": True, "coalesced": True},
                )
        except Exception:
            pass  # Fall through to normal query processing if leader timed out

    try:
        # ── Route through 7-level pipeline ───────────────────────────────────────
        start = time.monotonic()
        route_result = await intent.route_intent(
            body.query, db, role, user=current_user, mode=mode
        )
        routing_latency = int((time.monotonic() - start) * 1000)

        # ── Non-cloud result ──────────────────────────────────────────────────────
        signal = route_result.get("signal")

        if signal not in (intent.CLOUD_REQUIRED_SIGNAL,) and route_result.get("answer") is not None:
            route = route_result.get("route", "deterministic")
            response = AIDAQueryResponse(
                request_id=request_id,
                answer=route_result["answer"],
                source=route_result.get("source"),
                route=route,
                intent=route_result.get("intent"),
                ai_mode=_route_label(route),
                data=route_result.get("data"),
                sources=route_result.get("sources"),
                latency_ms=routing_latency,
                metadata={"cached": False},
            )
            # Notify in-flight listeners
            if my_fut and not my_fut.done():
                my_fut.set_result({
                    "answer": route_result["answer"],
                    "source": route_result.get("source"),
                    "route": route,
                    "intent": route_result.get("intent"),
                    "data": route_result.get("data"),
                    "sources": route_result.get("sources"),
                    "latency_ms": routing_latency,
                })
            # Cache safe results
            if route in ("deterministic", "okf", "rag", "local_llm"):
                ttl = _get_cache_ttl(route)
                await _set_cache(redis, cache_key, {
                    "answer": route_result["answer"],
                    "source": route_result.get("source"),
                    "route": route,
                    "intent": route_result.get("intent"),
                    "data": route_result.get("data"),
                    "sources": route_result.get("sources"),
                }, ttl)
            return response
    finally:
        if my_fut is not None:
            async with _coalescing_lock:
                if _in_flight_coalescing.get(cache_key) is my_fut:
                    _in_flight_coalescing.pop(cache_key, None)
            if not my_fut.done():
                my_fut.set_result(None)

    # ── Browser SLM signal ────────────────────────────────────────────────────
    if signal == intent.BROWSER_SLM_SIGNAL:
        return AIDAQueryResponse(
            request_id=request_id,
            answer=None,
            source="Browser",
            route="browser_slm",
            intent="browser_slm_handoff",
            ai_mode="Browser SLM",
            signal=intent.BROWSER_SLM_SIGNAL,
            query=body.query,
            latency_ms=routing_latency,
            metadata={"cached": False},
        )

    # ── Cloud LLM path ────────────────────────────────────────────────────────
    if signal != intent.CLOUD_REQUIRED_SIGNAL:
        return AIDAQueryResponse(
            request_id=request_id,
            answer="I couldn't find an answer from department data.",
            source="AIDA",
            route="fallback",
            intent="unknown",
            ai_mode="Fallback",
            latency_ms=routing_latency,
        )

    # Double-check student guard
    role_limit = settings.get_role_cloud_limit(role)
    if role_limit == 0:
        return AIDAQueryResponse(
            request_id=request_id,
            answer=(
                "Advanced cloud AI is restricted to authorized staff. "
                "AIDA can answer this using local department intelligence — "
                "please try rephrasing your question."
            ),
            source="Policy",
            route="blocked",
            intent="cloud_blocked",
            ai_mode="Blocked — Student",
            cloud_calls_used=0,
            cloud_calls_limit=0,
            latency_ms=routing_latency,
        )

    # Quota check (atomic)
    allowed, deny_reason, quota_before, quota_after = await quota_svc.check_and_consume_quota(
        redis, user_id, role
    )

    if not allowed:
        return AIDAQueryResponse(
            request_id=request_id,
            answer=deny_reason,
            source="Quota Policy",
            route="quota_exceeded",
            intent="quota_exceeded",
            ai_mode="Quota Exceeded",
            cloud_calls_used=quota_before,
            cloud_calls_limit=role_limit,
            latency_ms=routing_latency,
        )

    # Cloud provider call
    cloud_start = time.monotonic()
    success = False
    provider_result: dict = {}
    error_msg = None

    try:
        system_prompt = (
            "You are AIDA, the intelligent assistant for the AI & ML Department at Lyrahub. "
            "Answer questions about department students, faculty, research, and programs. "
            "Be concise, accurate, and professional. Never fabricate data."
        )
        provider_result = await provider_router.route_to_cloud(body.query, system_prompt)
        success = True
    except RuntimeError as e:
        error_msg = str(e)
        await quota_svc.rollback_quota(redis, user_id)
        quota_after = quota_before

    cloud_latency = int((time.monotonic() - cloud_start) * 1000)
    total_latency = routing_latency + cloud_latency

    # Audit log
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
            latency_ms=cloud_latency,
            success=success,
            reason_for_cloud_route="Local intelligence insufficient — cloud escalation",
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
        request_id=request_id,
        answer=provider_result.get("text"),
        source="Cloud AI (advanced reasoning)",
        route="cloud_llm",
        intent="cloud_generation",
        ai_mode=f"Cloud LLM ({provider_result.get('provider', 'unknown')})",
        cloud_calls_used=current_usage,
        cloud_calls_limit=role_limit,
        provider=provider_result.get("provider"),
        tokens_in=provider_result.get("tokens_in"),
        tokens_out=provider_result.get("tokens_out"),
        latency_ms=total_latency,
        metadata={"cached": False},
    )


def _route_label(route: str) -> str:
    labels = {
        "deterministic": "Deterministic (SQL)",
        "cache": "Cache",
        "browser_slm": "Browser SLM",
        "okf": "Department Knowledge (OKF)",
        "rag": "Document Library (RAG)",
        "local_llm": "Local AI",
        "cloud_llm": "Cloud AI",
        "fallback": "Fallback",
        "blocked": "Blocked",
    }
    return labels.get(route, route)


# ─── Quota Status ─────────────────────────────────────────────────────────────

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

    # Check local AI availability
    ollama = get_ollama_provider()
    ollama_ok = await ollama.is_available()

    return {
        "role": role,
        "cloud_ai_allowed": role_limit > 0 and settings.CLOUD_AI_ENABLED,
        "cloud_calls_limit": role_limit,
        "cloud_calls_used": used,
        "cloud_calls_remaining": max(0, role_limit - used),
        "reset_time": "00:00 Asia/Kolkata",
        "local_ai_available": ollama_ok,
        "ai_mode": "hybrid" if ollama_ok else "deterministic_rag",
    }


# ─── Model Health ─────────────────────────────────────────────────────────────

@router.get("/health/models")
async def get_model_health(
    current_user: User = Depends(get_current_active_user),
):
    """Returns health status of all configured AI models. Admin/HOD/Faculty only."""
    role = await _resolve_role(current_user)
    if role not in ("admin", "super_admin", "hod", "cos", "hos", "faculty", "teacher"):
        raise HTTPException(status_code=403, detail="Staff access required.")

    ollama = get_ollama_provider()
    ollama_ok = await ollama.is_available()
    ollama_models = await ollama.list_models() if ollama_ok else []

    health: list[dict] = []
    registry = get_registry()

    for model in registry:
        if model.model_type.value == "cloud_llm":
            keys = settings.get_provider_keys(model.provider.value)
            health.append({
                "model_id": model.model_id,
                "provider": model.provider.value,
                "type": model.model_type.value,
                "available": bool(keys),
                "description": model.description,
            })
        elif model.provider.value == "ollama":
            available = ollama_ok and any(
                m.startswith(model.model_id.split(":")[0]) for m in ollama_models
            )
            health.append({
                "model_id": model.model_id,
                "provider": "ollama",
                "type": model.model_type.value,
                "available": available,
                "description": model.description,
            })
        elif model.provider.value == "pattern":
            health.append({
                "model_id": model.model_id,
                "provider": "pattern",
                "type": model.model_type.value,
                "available": True,
                "description": model.description,
            })

    # OKF status
    try:
        okf = get_okf_engine()
        okf_docs = okf.get_all()
        okf_status = {"available": True, "document_count": len(okf_docs)}
    except Exception:
        okf_status = {"available": False, "document_count": 0}

    return {
        "ollama_online": ollama_ok,
        "ollama_models": ollama_models,
        "okf": okf_status,
        "models": health,
    }


# ─── Document Indexing ────────────────────────────────────────────────────────

@router.post("/knowledge/index")
async def index_document(
    body: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Index a document into the RAG knowledge base. Faculty+ only."""
    role = await _resolve_role(current_user)
    if role not in ("admin", "super_admin", "hod", "cos", "hos", "faculty", "teacher"):
        raise HTTPException(status_code=403, detail="Faculty or above required to index documents.")

    title = body.get("title", "").strip()
    content = body.get("content", "").strip()
    category = body.get("category", "general")
    access_scope = body.get("access_scope", "faculty:department")

    if not title or not content:
        raise HTTPException(status_code=400, detail="title and content are required.")
    if len(content) < 50:
        raise HTTPException(status_code=400, detail="content must be at least 50 characters.")

    result = await rag_service.index_document(
        db=db,
        title=title,
        content=content,
        category=category,
        source_type="upload",
        access_scope=access_scope,
        uploader_id=current_user.id,
        tags=body.get("tags"),
        metadata=body.get("metadata"),
    )
    return result


@router.get("/knowledge/documents")
async def list_knowledge_documents(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List indexed knowledge documents. Faculty+ only."""
    role = await _resolve_role(current_user)
    if role not in ("admin", "super_admin", "hod", "cos", "hos", "faculty", "teacher"):
        raise HTTPException(status_code=403, detail="Faculty or above required.")

    stmt = select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())
    if category:
        stmt = stmt.where(KnowledgeDocument.category == category)
    stmt = stmt.offset((page - 1) * limit).limit(min(limit, 100))

    result = await db.execute(stmt)
    docs = result.scalars().all()

    return {
        "page": page,
        "documents": [
            {
                "id": str(d.id),
                "title": d.title,
                "category": d.category,
                "access_scope": d.access_scope,
                "indexing_status": d.indexing_status,
                "chunk_count": d.chunk_count,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in docs
        ],
    }


# ─── Admin Endpoints ──────────────────────────────────────────────────────────

async def _require_admin(user: User) -> str:
    role = await _resolve_role(user)
    if role not in ["admin", "super_admin", "hod"]:
        raise HTTPException(status_code=403, detail="Admin or HOD access required.")
    return role


@router.get("/admin/usage", response_model=AIUsageSummary)
async def get_ai_usage_summary(
    target_date: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    """Today's cloud AI usage summary. Admin/HOD only."""
    await _require_admin(current_user)

    today_str = target_date or quota_svc._today_ist()
    try:
        target_date_obj = date.fromisoformat(today_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    stmt = select(AIUsageLog).where(AIUsageLog.usage_date == target_date_obj)
    result = await db.execute(stmt)
    logs = result.scalars().all()

    by_role: dict[str, int] = {}
    by_provider: dict[str, int] = {}
    total_tokens_in = total_tokens_out = total_latency = failed = successful_count = 0

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

    avg_latency = (total_latency / successful_count) if successful_count > 0 else None
    global_daily = await quota_svc.get_global_usage_today(redis)
    global_monthly = await quota_svc.get_global_usage_month(redis)

    return AIUsageSummary(
        date=today_str,
        total_cloud_calls=len(logs),
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
    """Paginated cloud AI usage audit logs. Admin/HOD only."""
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
async def get_ai_policy(current_user: User = Depends(get_current_active_user)):
    """Current AI gateway policy configuration. Admin/HOD only."""
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
