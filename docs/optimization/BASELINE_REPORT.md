# Lyrahub Master Optimization Cycle — Baseline Audit Report

**Date**: 2026-09-26  
**Auditor**: Antigravity Optimization & Hardening Engineering Team  
**Scope**: Full stack (Frontend, Backend, Database, AI/AIDA, Storage, Network, Security)

---

## 1. Executive Summary

This baseline report captures the empirical, measured state of the Lyrahub system prior to implementing optimization and hardening enhancements. Lyrahub is an enterprise department operating system connecting students, faculty, HOD, leadership, and alumni across academic curricula, rankings, projects, and AI department assistance.

### Key Baseline Findings
1. **Frontend Bundle**: 
   - Static First Load JS shared by all routes: **87.6 kB**.
   - `/dashboard` route JS is **42 kB** with First Load JS of **264 kB** due to static bundling of the entire Recharts library (Bar, Pie, Area, Tooltip, ResponsiveContainer) and un-deferred layout components.
   - `AIDAAssistant` (569 lines, heavy animations/markdown) is bundled synchronously in `DashboardShell.tsx`, inflating initial page load even before the user opens AIDA.
   - `next.config.mjs` triggers a Next.js 14 validation warning due to Next.js 15 key `serverExternalPackages`.
2. **Backend & Latency**:
   - `IS_SERVERLESS` in `backend/app/core/database.py` forced `NullPool` on SQLAlchemy for all development/Neon environments. Every HTTP request opened a new SSL connection to Sydney, Australia (`ap-southeast-2`), incurring 400ms–1500ms connection churn per query. Under concurrent test runs, request latency ballooned to 17–23 seconds.
   - Response compression (`GZipMiddleware`) is absent on FastAPI, transferring uncompressed JSON payloads for large tables.
   - Broken cache invocation in `projects/service.py` (`redis = get_redis()`) and `alumni/service.py` (`redis = get_redis()`) without `await` caused unawaited coroutine exceptions caught silently by `except Exception: pass`, resulting in a **0% cache hit rate** on project and alumni statistics.
3. **Database & Queries**:
   - 157 existing indexes exist across tables, but N+1 queries occur in `_enrich_project` (3 additional queries per project) and `_enrich_alumni` (1 additional query per alumni).
   - In `alumni/service.py`, registration lacks a check on unique `reg_no`, producing an unhandled 500 error when an existing student reg_no is registered twice.
4. **AI & AIDA System**:
   - The 7-level hybrid architecture (Deterministic → Redis → DB → Browser SLM → OKF → RAG → Local LLM → Cloud Fallback) is architected cleanly, but:
   - In `backend/app/modules/ai/router.py`, the cache key generator `_cache_key(user_id, query, role, mode)` takes `user_id` but omitted it from the resulting hash, risking cross-user response leakage for personalized user queries.
   - Cloud provider router creates a new `httpx.AsyncClient` on every request instead of reusing connection pools.
5. **Security & Secrets**:
   - JWT tokens have valid 15-minute access and 7-day refresh expirations.
   - Role-based permissions use Casbin enforcer with DB rules.
   - No cloud API keys or passwords are leaked to the client bundle.

---

## 2. Frontend Baseline Metrics

Measured from `npm run build` production build trace:

| Route | Route JS Size | First Load JS | Notes |
| :--- | :--- | :--- | :--- |
| **Shared by all routes** | — | **87.6 kB** | 31.9 kB core + 53.6 kB vendor + 2.04 kB utils |
| `/` (Landing Page) | 1.75 kB | 115 kB | Light initial shell |
| `/dashboard` | **42 kB** | **264 kB** | **Heaviest route** (Imports full Recharts statically) |
| `/ranking/me` | **11.3 kB** | **184 kB** | Recharts student percentile chart |
| `/dashboard/profile` | 17 kB | 151 kB | Form controls + dropzone |
| `/ai-usage` | 4.05 kB | 143 kB | Audit cards |
| `/login` | 4.91 kB | 137 kB | Quick fill, auth forms |
| `/courses` | 6.05 kB | 122 kB | Course list |
| `/opportunities` | 4.59 kB | 122 kB | Opportunities feed |
| `/projects` | 2.83 kB | 118 kB | Projects gallery |
| `/alumni` | 2.82 kB | 118 kB | Alumni directory |
| `/scan` | 5.29 kB | 121 kB | html5-qrcode dynamically loaded |

### Client vs Server Component Audit
- Total route pages: 59 static and dynamic routes.
- Client components currently marked with `'use client'`: Interactive pages and forms properly declare `'use client'`.
- Opportunity: Dynamic loading of Recharts in `/dashboard` will reduce First Load JS by ~80–100 kB.
- Opportunity: Dynamic loading of `AIDAAssistant` in `DashboardShell.tsx` will defer AI assistant code until clicked.

---

## 3. Backend & API Baseline Metrics

Measured via HTTP benchmark against local Uvicorn process (PID 10293):

| Metric | Measured Baseline | Target | Bottleneck Identified |
| :--- | :--- | :--- | :--- |
| `/api/v1/health/live` | **< 20 ms** | < 100 ms | In-memory FastAPI router, optimal |
| `/api/v1/health/ready` (Idle) | **8.04s – 18.84s** | < 300 ms | WAN SSL TLS handshake to Neon + Redis remote ping |
| `/api/v1/health/ready` (Load) | **17.77s – 23.54s** | < 500 ms | `NullPool` connection churn + single worker thread |
| Compression | **None (0%)** | Brotli/GZip | Starlette `GZipMiddleware` absent |
| Redis Connection | Singleton client | Persistent | `get_redis()` unawaited in 2 service modules |
| Cache Hit Rate (Stats) | **0%** | > 80% | Unawaited coroutine in `projects` & `alumni` stats |

---

## 4. Database Baseline Metrics

Measured against Neon PostgreSQL instance:
- **Total Tables**: 29
- **Total Indexes**: 157
- **Database Engine Driver**: `asyncpg` via SQLAlchemy 2.0 Async
- **Pool Class**: `NullPool` (forced by `IS_SERVERLESS = True`)
- **Query Latencies**:
  - `SELECT 1` on cold connection (auto-suspend wake): **27.63s**
  - `SELECT 1` on pooler cold connection: **39.25s**
  - `SELECT 1` on warm connection: **1.94s** (WAN latency India ↔ Sydney)
- **N+1 Query Hotspots**:
  1. `get_projects` in `projects/service.py`: 1 project fetch + 3 sub-queries per project row (`ProjectMember`, `ProjectDocument`, `User.email`). For 20 items: **61 SQL queries**.
  2. `get_alumni` in `alumni/service.py`: 1 alumni fetch + 1 sub-query per alumni row (`AlumniExperience`). For 20 items: **21 SQL queries**.

---

## 5. AI / AIDA Baseline Metrics

Measured against `backend/app/modules/ai`:
- **Architecture**: 7-level hybrid intent router.
- **Deterministic Patterns**: 24 distinct regex patterns mapping directly to optimized SQL queries (0 LLM tokens, 0 cloud cost).
- **RAG Engine**: pgvector with cosine distance similarity search on `knowledge_documents`.
- **Cloud Quotas**:
  - Student: 0/day (hard blocked, local only)
  - Faculty: 1/day
  - HOD: 5/day
  - Global: 25/day, 100/month
- **Cache Isolation Issue**:
  `_cache_key` passed `user_id` as parameter, but omitted it from the cache key string, resulting in shared cache between users with the same role and mode.

---

## 6. Storage Baseline Metrics
- Local storage provider active in development mode (`/backend/storage/uploads`).
- Cloudflare R2 client configured for production via S3-compatible API.
- File upload verification: MIME checks present in `files/router.py`.

---

## 7. Security Baseline Metrics
- Passwords hashed with `pwd_context` (bcrypt / argon2).
- RBAC enforced via Casbin table `casbin_rule` in PostgreSQL.
- Access token expiry: 900s (15 min). Refresh token expiry: 604800s (7 days).
- Token revocation: Redis-based token blacklist (`bl_{token}`).
- Security headers in `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Secret scanning: No API keys or database connection strings found in frontend bundles.

---

## 8. Prioritized Optimization Action Plan

Based on the measured baselines, the optimization cycle will proceed in the following prioritized sequence:
1. **P0**: Fix Cache Isolation bug in AIDA `_cache_key` to guarantee zero cross-user data leakage.
2. **P0**: Fix unawaited `get_redis()` coroutines in `projects/service.py` and `alumni/service.py`.
3. **P0**: Fix unique constraint handling on `alumni/service.py` `reg_no` registration.
4. **P1**: Replace `NullPool` with `AsyncAdaptedQueuePool` with sensible pool size and keep-alives to eliminate SSL handshake churn.
5. **P1**: Enable `GZipMiddleware` on FastAPI in `main.py` for automatic response compression.
6. **P1**: Eliminate N+1 queries in `projects/service.py` and `alumni/service.py` using batch queries.
7. **P1**: Dynamic import Recharts in `frontend/src/app/dashboard/page.tsx` and dynamic import `AIDAAssistant` in `DashboardShell.tsx`.
8. **P1**: Correct `next.config.mjs` config key for Next.js 14.
