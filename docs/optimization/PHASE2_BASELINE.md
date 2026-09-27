# Lyrahub Phase 2 Deep Optimization — Baseline Audit Report

**Date**: 2026-09-26  
**Auditor**: Antigravity Optimization & Hardening Engineering Team  
**Scope**: Full Stack Empirical Verification & Profiling  
**Methodology**: Rule Zero Verification (Implemented → Executed → Measured → Compared → Verified)  

---

## 1. Executive Summary

This Phase 2 baseline establishes the empirical ground truth for the Lyrahub system following the initial master optimization cycle. Crucially, this audit differentiates between **actual execution** vs **superficial plumbing/signals**. 

### Critical Findings & Reality Checks
1. **Browser SLM Reality**: The Phase 1 benchmark reported `browser_slm` routing, but inspecting `frontend/src/components/features/ai/AIDAAssistant.tsx` reveals it was merely returning a static placeholder text (*"Processed locally via Browser SLM..."*) upon receiving the `__BROWSER_SLM__` signal. **No actual model runtime (WebLLM, ONNX, or WASM tokenizer) is executing in the client browser.**
2. **Local AI / Ollama Reality**: `ollama` is NOT installed on the host (`which ollama` returned exit code 1), and no local GGUF/transformers weights exist in `backend/venv`. The system degrades safely to OKF and deterministic tools, but Local SLM / Local LLM inference cannot execute locally until a runtime is active.
3. **Database Sequential Scans**: An empirical query of PostgreSQL `pg_stat_user_tables` revealed significant sequential scan pressure on `casbin_rule` (304 seq scans) and `students` (218 seq scans), representing target areas for Phase 7 query plan and index tuning.
4. **Redis Status**: The production Redis Cloud instance is active (`db.redis.io:15762`), with 34 active keys, 32.1% hit ratio, and 2.37 MB memory consumption.

---

## 2. Empirical Baseline Metrics

### A. Frontend Runtime & Network
Empirically measured from production build analyzer (`npm run build`) and warm HTTP request timings (`http://localhost:3000`):

| Metric | Measured Value | Verification Source |
| :--- | :--- | :--- |
| **TTFB (Root `/`)** | **56.2 ms** (Cold), **12.4 ms** (Warm) | `curl -w %{time_starttransfer}` |
| **TTFB (`/dashboard`)** | **1,490 ms** (Cold), **18.4 ms** (Warm) | `curl -w %{time_starttransfer}` |
| **JS Transferred (`/dashboard`)** | **145.0 kB** (First Load JS) | Next.js 14 production build trace |
| **Route JS Size (`/dashboard`)** | **8.01 kB** | Next.js 14 production build trace |
| **Shared Base JS** | **87.7 kB** (31.9 kB core + 53.6 kB vendor) | Next.js 14 production build trace |
| **FCP (First Contentful Paint)** | `NOT MEASURED` (Requires headless Chrome) | Rule Zero compliant |
| **LCP (Largest Contentful Paint)**| `NOT MEASURED` (Requires headless Chrome) | Rule Zero compliant |
| **INP (Interaction to Next Paint)**| `NOT MEASURED` (Requires browser user events) | Rule Zero compliant |
| **CLS (Cumulative Layout Shift)**| `NOT MEASURED` (Requires browser rendering) | Rule Zero compliant |
| **Hydration Time** | `NOT MEASURED` (Requires React Profiler trace) | Rule Zero compliant |
| **Route Transition Time** | `NOT MEASURED` (Requires Client-side profiler) | Rule Zero compliant |
| **Memory Usage (Heap)** | `NOT MEASURED` (Requires Chrome memory snapshot)| Rule Zero compliant |
| **Largest Components** | `DashboardCharts` (Recharts), `AIDAAssistant`, `DashboardSidebar` | Next.js chunk breakdown |

---

### B. Backend Performance
Empirically measured against `http://127.0.0.1:8000` over 100 requests:

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **`GET /api/v1/health/live`** | **p50: 3.4 ms** \| **p95: 5.8 ms** | Fast process liveness |
| **`GET /api/v1/health/ready`** | **p50: 1,420 ms** \| **p95: 1,840 ms** | DB + Redis active roundtrips |
| **`GET /api/v1/projects/stats`** | **p50: 435.7 ms** \| **p95: 1,022.0 ms** | Cached reads 4–12ms, warm DB ~435ms |
| **`GET /api/v1/courses`** | **p50: 5,648.6 ms** \| **p95: 8,937.9 ms** | Heavy cross-table scan to Neon |
| **Requests / sec (Single Thread)**| **0.71 req/s** (stats) \| **0.16 req/s** (courses) | Bound by oceanic network RTT |
| **Error Rate** | **0.0%** on `/health` \| **8.0%** (2 timeout drops on courses) | Under sequential load |
| **Database Latency (`SELECT 1`)**| **12.8 ms** (Warm pool) to **340 ms** (Oceanic) | Measured via SQLAlchemy engine |
| **Redis Latency (`PING`)** | **1,427.2 ms** (Cold) \| **280 ms** (Warm) | Connection to Redis Cloud |
| **Serialization Time** | `< 1.2 ms` | Pydantic v2 compiled core |

---

### C. Database Metrics (PostgreSQL 16 on Neon)
Empirically queried from `pg_stat_user_tables` and `engine.pool`:

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Pool Size / Max Overflow** | **10 size / 20 max overflow** | `AsyncAdaptedQueuePool` |
| **Session Checkout Latency** | **0.05 ms** | In-memory pool checkout |
| **Checked In / Checked Out** | **0 active / 0 checked out** (idle baseline) | Ready for connection allocation |
| **Top Table Sequential Scans**: | | |
| - `casbin_rule` | **304 seq scans** (3,085 tuples read) | Policy reload scans full table |
| - `students` | **218 seq scans** (3,242 tuples read) | Unindexed filter queries in dashboard |
| - `tests` | **150 seq scans** (3,976 tuples read) | Test management listings |
| - `users` | **78 seq scans** (vs **1,659 idx scans**) | Index scans dominant (healthy) |
| - `leadership_profiles` | **58 seq scans** (211 tuples read) | Table small (2 rows) |
| - `alumni` | **30 seq scans** (vs **50 idx scans**) | Needs composite index tuning |
| - `skills` | **28 seq scans** (vs **180 idx scans**) | Skill aggregations |
| **Slowest Queries** | Courses listing join; Unfiltered approvals scan | EXPLAIN ANALYZE planned in Phase 7 |

---

### D. Redis Metrics (Redis Cloud `db.redis.io`)
Empirically queried via Redis `INFO`:

| Metric | Measured Value | Verification Source |
| :--- | :--- | :--- |
| **Keyspace Hits** | **52** | Redis `INFO stats` |
| **Keyspace Misses** | **110** | Redis `INFO stats` |
| **Hit Ratio** | **32.1%** | Calculated: 52 / (52 + 110) |
| **Used Memory** | **2.37 MB** | Redis `INFO memory` |
| **Evicted Keys** | **0** | No memory pressure |
| **Total Commands Processed** | **306** | Redis `INFO stats` |
| **Active Keys** | **34 keys** (32 with expiration TTLs) | Redis `INFO keyspace` |

---

### E. AI / AIDA Inference Baseline
Empirically measured from the 50-query execution trace:

| Metric | Measured Value | Verification Source |
| :--- | :--- | :--- |
| **Total Queries Executed** | **50** | `benchmark_aida.py` |
| **Successful Executions** | **48 / 50 (96.0%)** | HTTP 200 responses |
| **Routing Breakdown**: | | |
| - `okf` (Knowledge Base) | **30 queries (60.0%)** | Department documents, policies |
| - `deterministic` (SQL Tools) | **10 queries (20.0%)** | Counts, rankings, rosters |
| - `browser_slm` (Signal Only) | **5 queries (10.0%)** | **Signal only — no actual client model** |
| - `rag` (pgvector) | **3 queries (6.0%)** | Embeddings distance search |
| - `local_slm` / `local_llm` | **0 queries (0.0%)** | Ollama offline / not installed |
| - `cloud_llm` (Paid Cloud) | **0 queries (0.0%)** | Guardrails active; 0 cloud spend |
| - `error` / timeouts | **2 queries (4.0%)** | Query 39 timeout, Query 45 503 |
| **Cache Hits on Repeat** | **15 / 15 (100.0%)** | Redis Level 1 cache verified |
| **Average Latency** | **7,042.39 ms** | Cross-continental DB link bound |
| **Median (P50) Latency** | **6,263.76 ms** | Realistic baseline |
| **P95 Latency** | **15,122.87 ms** | Multi-table aggregations |
| **P99 Latency** | **15,591.80 ms** | Ranking weight queries |
| **Tokens / Query (Cloud)** | **0 tokens ($0.00)** | Zero cloud spend verified |

---

## 3. Prioritized Targets for Phase 2 Deep Optimization

1. **Phase 2 — Actual Browser SLM Implementation**: Replace the static string placeholder in `AIDAAssistant.tsx` with an actual client-side inference engine using `@xenova/transformers` or `onnxruntime-web` (WebGPU + WASM fallback).
2. **Phase 5 & 6 — AIDA Router Optimization & 100-Query Benchmark**: Expand benchmark to 100 queries; ensure deterministic SQL tools answer before OKF/RAG, reducing unnecessary knowledge base searches.
3. **Phase 7 & 8 — Database Query Plan & Index Tuning**: Address the 304 sequential scans on `casbin_rule` and 218 on `students` with target indexes and query plan fixes.
4. **Phase 9 & 10 — Connection Pool Tuning & Concurrency Testing**: Run 50–250 concurrent user load tests to evaluate pool sizing under load.
5. **Phase 12 & 13 — Request Coalescing & Cache Deep Audit**: Implement single-flight / coalescing on public department queries to avoid cache stampedes.
6. **Phase 20 & 21 — Security Hardening & Prompt Injection Defense**: Run adversarial test suites against AIDA authorization barriers.
