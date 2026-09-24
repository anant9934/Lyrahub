---
name: fastapi-backend
description: Builds Python FastAPI backend with SQLAlchemy 2.0, Pydantic,
  async support, JWT auth, and domain modules. Use when writing API
  endpoints, request/response models, services, or backend business logic.
---

# FastAPI Backend Development

## When to use this skill
- Writing any Python backend code for the hub.
- Creating API endpoints, request/response schemas, or services.
- Integrating with the database, Redis, or external services.
- Implementing business logic (ranking, scoring, approval workflows).

## Core Rules

1. Always use **Pydantic v2** for request and response validation.
2. Use **SQLAlchemy 2.0** with **async** sessions (asyncpg driver).
3. Structure code by **domain module** — never one giant file.
4. Every endpoint MUST have a typed `response_model`.
5. Use **dependency injection** for DB sessions and current user.
6. No synchronous DB calls anywhere.
7. No business logic in routers — put it in `service.py`.
8. No hardcoded credentials — read from env vars.
9. Never `SELECT *` — always specify columns.
10. Every error follows RFC 7807 Problem Details.

## Project Structure

backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings from env
│   │   ├── security.py        # JWT, password hashing
│   │   ├── database.py        # Async engine, session factory
│   │   ├── redis.py           # Redis client
│   │   └── dependencies.py    # get_db, get_current_user
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── schema.py
│   │   │   └── model.py
│   │   ├── students/
│   │   ├── faculty/
│   │   ├── ranking/
│   │   ├── chatbot/
│   │   └── admin/
│   ├── shared/
│   │   ├── exceptions.py
│   │   ├── middleware.py
│   │   └── utils.py
│   └── main.py
├── alembic/
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── requirements.txt
└── Dockerfile

## Endpoint Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.modules.students.schema import StudentRankResponse
from app.modules.students.service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/ranked", response_model=list[StudentRankResponse])
async def get_ranked_students(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[StudentRankResponse]:
    service = StudentService(db)
    return await service.get_ranked(limit=limit, user=user)
```

## Authentication Rules
- JWT access token: 15-minute expiry.
- JWT refresh token: 7-day expiry.
- Refresh tokens stored in Redis with sliding expiration.
- Logout blacklists refresh token in Redis (TTL = token remaining life).
- All protected endpoints use `Depends(get_current_user)`.
- Password hashing: **Argon2id** (via `passlib` or `argon2-cffi`).

## Error Handling
- Return RFC 7807 Problem Details for ALL errors.
- Never leak stack traces to client.
- Log every 4xx and 5xx with `request_id`.

```python
raise HTTPException(
    status_code=404,
    detail={
        "type": "https://hub.example/errors/not-found",
        "title": "Student not found",
        "status": 404,
        "detail": f"No student with reg_no {reg_no}",
        "instance": request.url.path,
    },
)
```

## Anti-Patterns (NEVER do these)
- ❌ Synchronous DB calls in async endpoints
- ❌ Returning raw dict instead of Pydantic model
- ❌ Business logic in router
- ❌ Hardcoded credentials
- ❌ `SELECT *`
- ❌ Catch-all `except Exception` without logging
- ❌ Circular imports between modules

## Testing Hooks
- Every service function must be independently testable.
- Inject DB session and external clients (Redis, Ollama).
- No global state.
- Use `pytest-asyncio` for async tests.

---
