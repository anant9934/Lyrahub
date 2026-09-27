# AIMETRA — AI & AIDA Security Architecture

This document specifies the security controls governing AIMETRA's artificial intelligence intelligence layer, AIDA, its retrieval pipeline, and LLM integrations.

---

## 1. Operating Principle: Externalized AI Governance

```
User Query
    │
    ▼
[ Application Authorization & Rate Limit ]
    │
    ▼
[ Prompt Injection & Adversarial Scanner ]
    │
    ▼
[ Scope-Filtered Document Retrieval (RAG) ]
    │
    ▼
[ Model Reasoning (Local SLM / Quota-Gated Cloud) ]
    │
    ▼
[ Output Validation & Sanitization ]
    │
    ▼
Audit Log & User Response
```

**Golden Rule:** Security exists **outside** the AI, not inside it.
* The model may reason.
* The application decides.
* The database enforces.
* The audit trail records.
* The LLM **never** determines user identity, roles, permissions, or access grants.

---

## 2. 7-Level Routing Pipeline & Zero-Trust Gating

1. **Authentication:** `get_current_user` extracts and verifies JWT identity.
2. **Role Resolution:** Server-side RBAC verifies permitted capabilities.
3. **Cache Check:** User-isolated Redis cache (`aida:{scope_hash}:{query_hash}`) checked for identical prior queries within TTL.
4. **Adversarial Interception:** `_detect_prompt_injection` scans query against known jailbreak/override signatures.
5. **Deterministic Tools & OKF:** Academic queries (GPA, semester dates, credits) resolved using deterministic database queries or verified One-Knowledge-File documents without invoking generative LLMs.
6. **RAG Scope Isolation:** Vector similarity search applies pre-retrieval filters (`_get_accessible_scopes(role)`). Students can never match private faculty notes, confidential research drafts, or another student's submission.
7. **Cloud Policy & Quota:**
   * **Students are strictly prohibited from cloud LLM fallback.** All student requests route to local SLMs (Browser SLM or Ollama).
   * **Faculty & Admins** may trigger cloud fallback only if local inference fails and their daily token quota (managed atomically via Redis) has not been exceeded.

---

## 3. Prompt Injection & Jailbreak Defenses

### Direct Injection Interception
Every input query is scanned for adversarial prompt patterns prior to processing:
* Direct override keywords: `"ignore previous instructions"`, `"disregard all prior instructions"`, `"system prompt reveal"`
* Jailbreak modes: `"DAN mode"`, `"developer mode"`, `"jailbreak"`
* Privilege manipulation: `"act as superadmin"`, `"bypass all authorization"`
* Destructive SQL: `"drop table"`, `"delete from users"`, `"truncate table"`

Matches are immediately rejected with `HTTP 400 Bad Request: Potential prompt injection or adversarial instruction detected`.

### Delimiter Encapsulation
When passing retrieved context to the LLM, context chunks are encapsulated in strict XML/Markdown delimiters:
```
<untrusted_reference_document id="...">
[Document text retrieved from RAG]
</untrusted_reference_document>
```
The system prompt strictly instructs the model that content inside `<untrusted_reference_document>` is untrusted data and must never be interpreted as commands or instructions.

---

## 4. Text-to-SQL Governance

If AIDA processes natural language questions requiring database queries:
1. **SELECT-Only Whitelist:** Queries are parsed into an Abstract Syntax Tree (AST). Any non-`SELECT` statement is immediately terminated.
2. **Disallowed Clauses:** Statements containing `INTO`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `CREATE`, or multi-statement delimiters (`;`) are rejected.
3. **Dangerous Function Blocking:** Calls to `pg_sleep`, `pg_read_file`, `pg_ls_dir`, or `dblink` are strictly blocked.
4. **Execution Safeguards:** Executed strictly against a read-only database replica or read-only connection with a 5-second statement timeout and a hard cap of 50 rows returned.

---

## 5. Cloud Provider Key Security & Quotas

* **No Frontend Leakage:** Cloud API keys (Groq, Cerebras, Mistral, Gemini, OpenRouter) are strictly backend environment variables. Never present in `NEXT_PUBLIC_*` or client bundles.
* **Atomic Redis Quota Tracking:** Usage logs track per-user token consumption daily. If quota is exhausted, cloud access fails closed and falls back to local cached or deterministic responses.
* **Egress Data Minimization:** PII (phone numbers, personal addresses, government IDs) is stripped from RAG chunks before transmitting queries to external cloud endpoints.
