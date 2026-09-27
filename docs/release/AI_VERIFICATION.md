# AIMETRA — AI & AIDA Engine Verification Report

This report presents test results and validation evidence for the **AIDA** (AIMETRA Intelligence & Data Assistant) hybrid intelligence stack.

---

## 1. AIDA Multi-Level Routing Pipeline

```
Question
   │
   ▼
[ Level 0: Authentication & Scope Resolution ]
   │
   ▼
[ Level 1: Prompt Injection & Adversarial Scanner ]
   │
   ▼
[ Level 2: User-Isolated Cache Check (Redis) ]
   │
   ▼
[ Level 3: Deterministic Tools (Structured DB Queries) ]
   │
   ▼
[ Level 4: One-Knowledge-File (OKF) Institutional Engine ]
   │
   ▼
[ Level 5: pgvector Semantic RAG (Scope-Filtered Retrieval) ]
   │
   ▼
[ Level 6: Local SLM (Browser / Ollama Local Inference) ]
   │
   ▼
[ Level 7: Quota-Gated Cloud Fallback (Faculty & Leadership only) ]
```

---

## 2. Test Execution & Concrete Evidence (`tests/test_phase5_aida.py`)

All 9 AIDA evaluation and security tests passed cleanly:

```text
tests/test_phase5_aida.py::test_deterministic_intent_classification PASSED [ 11%]
tests/test_phase5_aida.py::test_okf_engine_loaded_documents PASSED       [ 22%]
tests/test_phase5_aida.py::test_okf_search_policy_retrieval PASSED       [ 33%]
tests/test_phase5_aida.py::test_okf_search_hod_profile PASSED            [ 44%]
tests/test_phase5_aida.py::test_document_scope_authorization PASSED      [ 55%]
tests/test_phase5_aida.py::test_student_cloud_quota_is_strictly_zero PASSED [ 66%]
tests/test_phase5_aida.py::test_prompt_injection_sanitization PASSED     [ 77%]
tests/test_phase5_aida.py::test_response_contract_schema PASSED          [ 88%]
tests/test_phase5_aida.py::test_model_registry_contains_required_tiers PASSED [100%]
```

### 2.1 Level 3: Deterministic Tool Routing
* Queries such as `"How many students are enrolled?"`, `"total students"`, `"top 10 students"`, and `"show courses"` are classified deterministically without invoking generative LLMs.
* Queries execute directly against optimized PostgreSQL count/aggregate queries with zero hallucination risk.

### 2.2 Level 4: One-Knowledge-File (OKF) Engine
* Verified 4 authoritative institutional markdown documents loaded in memory:
  * Academic policies, attendance regulations, grading scales, and HOD leadership profile.
* Semantic keyword searches successfully resolve institutional inquiries with exact text matches and source attribution.

### 2.3 Level 5: RAG Isolation & Pre-Retrieval Scoping
* Tested document scope authorization:
  * Student accounts are restricted strictly to `public` documents and their own uploaded course materials.
  * Faculty and HOD accounts have access to departmental curricula and moderation guides.
  * Confidential documents are filtered out at the SQL query stage prior to embedding comparison, preventing cross-user data leakage.

### 2.4 Level 6 & 7: Cloud AI Gating & Student Prohibition
* **Rule:** Students NEVER get cloud LLM access.
* **Test:** Verified that calling the quota service for a Student user returns `daily_limit = 0`.
* **Faculty Quotas:** Faculty accounts receive daily token allowances tracked atomically in Redis (`INCRBY` / `EXPIRE`). Once exhausted, queries fail closed to local inference.

### 2.5 Prompt Injection Defense
* Inputs containing `"Ignore previous instructions"`, `"DAN mode"`, `"Act as superadmin"`, or `"DROP TABLE"` are flagged by `_detect_prompt_injection` and rejected immediately with `HTTP 400 Bad Request`.

---

## 3. Text-to-SQL AST Validation Standards

When natural language questions are converted to SQL:
1. **Parser:** The SQL is parsed into an Abstract Syntax Tree (AST).
2. **Whitelist:** Only `SELECT` statements are permitted. Statements containing `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, or `TRUNCATE` are rejected.
3. **Execution Limits:** Executed against a read-only database connection with a 5-second timeout and a strict limit of 50 rows.
4. **Forbidden Functions:** Dangerous functions (`pg_sleep`, `pg_read_file`, `dblink`) are blocked.
