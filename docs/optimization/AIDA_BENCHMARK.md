# AIDA 7-Level AI Architecture Empirical Benchmark Report

**Date**: 2026-09-26  
**Cycle**: Master Optimization & Hardening Cycle  
**Test Suite**: 50-Query Multi-Perspective Benchmark (`benchmark_aida.py`)  
**Target Gateway**: `POST /api/v1/ai/query` (Hybrid Mode)  

---

## 1. Executive Summary

AIDA (Academic & Institutional Digital Assistant) was benchmarked under real network conditions using authenticated student and HOD credentials. The benchmark tested 50 diverse queries across departmental facts, personalized student queries (CGPA, attendance, ranking), public curriculum data, repeated cache keys, administrative analytics, and conversational fallback.

### Key Benchmark Takeaways
1. **Zero Cloud API Spend for Students**: 100% of student queries were intercepted by deterministic tools, OKF knowledge retrieval, RAG, or delegated to Browser SLM. Zero paid cloud API tokens were spent.
2. **Intent Routing Accuracy**:
   - 30 queries resolved via **OKF Engine** (department documents, curricula, rules).
   - 10 queries resolved via **Deterministic SQL** (student ranking, counts, faculty rosters).
   - 3 queries resolved via **RAG / pgvector** (semantic ranking and alumni lookup).
   - 5 queries resolved via **Browser SLM Signal** (general student conversational prompts).
3. **Cache Repeatability**: All 15 repeated queries successfully hit Redis Level 1 cache with user-scoped isolation.

---

## 2. Summary Statistics

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Total Benchmark Queries** | **50** | Multi-category coverage |
| **Successful Executions** | **48 / 50 (96.0%)** | 2 edge timeouts on unindexed analytical queries |
| **Average Latency** | **7,042.39 ms** | Bound by oceanic network RTT to Neon (`ap-southeast-2`) |
| **Median (P50) Latency** | **6,263.76 ms** | Realistic cross-continental round-trip |
| **P95 Latency** | **15,122.87 ms** | Peak complex multi-table analytical queries |
| **P99 Latency** | **15,591.80 ms** | Complex ranking algorithm weight explanations |
| **Cache Hit Ratio (Repeats)**| **15 / 15 (100%)** | Level 1 Redis cache active and verified |
| **Zero Cloud Token Spend** | **100% Verified** | Zero external cloud billing incurred |

---

## 3. Route Distribution Breakdown

```
OKF Knowledge Base:       ██████████████████████████████ 30 (60.0%)
Deterministic SQL Tools:  ██████████ 10 (20.0%)
Browser SLM Offload:      █████ 5 (10.0%)
RAG / pgvector Search:    ███ 3 (6.0%)
Unresolved / Edge:        ██ 2 (4.0%)
```

### Route Descriptions
1. **`okf` (30 Queries)**: Handled queries regarding HOD details, department emails, laboratory guidelines, course syllabi, program descriptions, and departmental honors.
2. **`deterministic` (10 Queries)**: Executed direct parameterized database aggregations for enrolled student counts, ranking leaderboards, faculty lists, and ratio analyses.
3. **`browser_slm` (5 Queries)**: Issued client signals to execute lightweight WebLLM / small language models directly inside the student's browser for general conversational assistance.
4. **`rag` (3 Queries)**: Performed cosine distance similarity searches against pgvector embeddings in Neon.

---

## 4. Cache Isolation & Security Validation

The benchmark validated that personalized student queries are strictly isolated in Redis:
- Student query: *"What is my CGPA?"* cached under `aida:resp:user:<uuid>:...`
- Re-querying *"What is my CGPA?"* returned the cached result with `cached=True` without triggering re-execution of database queries.
- Public queries (e.g., *"Who is the HOD?"*) were cached under `aida:resp:shared:...` for fast global sharing across all users.
