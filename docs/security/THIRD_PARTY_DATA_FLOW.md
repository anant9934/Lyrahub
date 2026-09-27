# AIMETRA — Third-Party Data Flow & Service Inventory

This document maps all external data flows, service dependencies, and transmission boundaries connected to the AIMETRA platform.

---

## 1. External Integrations Matrix

| Provider | Purpose | Data Transmitted | Authentication | Retention Policy | Failure Mode |
|---|---|---|---|---|---|
| **Neon PostgreSQL** | Primary relational & vector database | User accounts, student records, courses, pgvector embeddings | TLS encrypted connection string with password | Managed database with automated daily snapshots | Fail closed (API returns 503) |
| **Redis** | Session blacklist, rate limits, AIDA cache, AI quotas | Cache keys, hashed queries, rate limit counters, user IDs | Password authenticated via TLS in production | In-memory with TTL-based automatic expiration | Fail closed on auth / rate limits; bypass non-essential cache |
| **Cloudflare R2** | Document, resume, and media storage | Encrypted resume PDFs, certificate images, project screenshots | AWS S3 SDK (v4 Signature) with Access Key / Secret | Retained until user deletion or institutional archive | Fail closed (404/500 on asset fetch) |
| **Cloudflare DNS / WAF** | Edge protection, DDoS mitigation, SSL termination | Incoming HTTP request headers, IP address, user agent | Cloudflare API Token | Edge logs retained according to enterprise plan | Block malicious requests at edge |
| **Ollama (Self-Hosted)** | Local AI inference for students & faculty | Academic queries, sanitized RAG context chunks | Internal HTTP loopback / Cloudflare Tunnel | Zero external retention (stateless local memory) | Fail open to next fallback tier or return error |
| **Cloud AI Providers (Groq, Cerebras, Mistral, Gemini)** | Optional fallback inference for Faculty/Admins | Academic questions, technical AI queries (strictly sanitized) | Bearer API Key stored in backend environment variables | Zero data retention agreements (API terms of service) | Fail closed; fallback to cached or deterministic error |
| **Sentry (Optional)** | Application error tracking & telemetry | Exception traces, HTTP status codes, redacted request URLs | DSN Token | 30 days rolling retention | Discard error events if service unavailable |

---

## 2. Egress Data Minimization & Guardrails

### 2.1 AI Cloud Egress Guardrails
* **No Direct Student Cloud Egress:** All student queries are processed either by deterministic tools, OKF local files, browser SLMs, or on-premise Ollama instances. Student data never exits the institutional perimeter to commercial cloud LLMs.
* **PII Redaction Before Cloud Egress:** For Faculty/Admin queries that escalate to cloud providers, queries are scrubbed of phone numbers, emails, roll numbers, and personal identifiers before dispatch.
* **Backend Proxying:** The frontend never connects directly to cloud AI APIs. All calls are initiated from FastAPI backend workers, preventing client-side API key exposure.

### 2.2 Storage & R2 Guardrails
* Private storage objects are never exposed via public buckets or persistent public URLs.
* Every download link is a temporary pre-signed URL generated dynamically after authenticating user ownership.
