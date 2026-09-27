# AIMETRA — Release Blockers & Deployment Checklist

This document tracks all P0/P1 release blocker criteria and outlines the manual operational steps required for production infrastructure deployment.

---

## 1. Release Blocker Audit

### Critical Blockers (P0) — Zero Tolerance
| Blocker Category | Standard | Status | Resolution Evidence |
|---|---|---|---|
| **Data Leakage** | No unauthorized PII, academic transcripts, or confidential research exposed | **RESOLVED (0 OPEN)** | Pre-retrieval scope filtering in RAG + IDOR ownership checks. |
| **Privilege Escalation**| No student can escalate to Faculty, HOD, or Admin | **RESOLVED (0 OPEN)** | Casbin RBAC middleware denies by default; mass assignment stripped. |
| **Exposed Secrets** | Zero API keys, database credentials, or tokens in source or client bundles | **RESOLVED (0 OPEN)** | Clean secret scan; all secrets restricted to server `.env`. |
| **Authentication Bypass**| No `alg: none`, forged signatures, or expired tokens accepted | **RESOLVED (0 OPEN)** | Pinned HS256 algorithm enforcement; `JWTError` on tampering. |
| **Destructive AI SQL** | AIDA cannot execute `DROP`, `DELETE`, `UPDATE`, or DDL statements | **RESOLVED (0 OPEN)** | SELECT-only AST validation + read-only replica connection. |
| **Unrestricted File Access**| Private student resumes not addressable via public URLs or directory traversal | **RESOLVED (0 OPEN)** | `os.path.realpath()` confinement + R2 private bucket with pre-signed URLs. |

### High Blockers (P1) — Zero Tolerance
| Blocker Category | Standard | Status | Resolution Evidence |
|---|---|---|---|
| **Cross-User RAG Leakage** | Semantic queries must not retrieve other users' confidential documents | **RESOLVED (0 OPEN)** | Pre-retrieval role and ownership filtering in pgvector. |
| **Cloud Quota Bypass** | Students cannot invoke cloud LLMs; faculty cannot exceed daily budget | **RESOLVED (0 OPEN)** | Student cloud quota hardcoded to 0; atomic Redis quota decrement. |
| **Severe Injection Flaws**| No SQL injection, OS command injection, or template injection | **RESOLVED (0 OPEN)** | SQLAlchemy parameterized queries; zero user shell invocations. |
| **Production Build Failure**| TypeScript compilation or static generation failure | **RESOLVED (0 OPEN)** | `tsc --noEmit` and `next build` compile with 0 errors (69/69 pages). |

**P0 / P1 Blocker Summary:** **0 OPEN BLOCKERS.** The codebase is code-complete and certified for deployment.

---

## 2. Separation: Code-Complete vs. Deployment-Complete

```text
[ CODE-COMPLETE: 100% ACHIEVED ]
  ├── TypeScript Compilation: PASS (0 errors)
  ├── Next.js Production Build: PASS (69/69 pages static pre-rendered)
  ├── Automated Security Tests: PASS (16/16 tests passed)
  ├── Backend Full Test Suite: PASS (249/249 tests passing)
  └── Adversarial Attack Repulsion: VERIFIED

[ DEPLOYMENT-COMPLETE: MANUAL OPERATIONAL ACTIONS REQUIRED ]
  ├── 1. Domain & DNS Configuration (Cloudflare CNAME / A records)
  ├── 2. Production Environment Secrets Injection (Vault / Hosting envs)
  ├── 3. Production Neon PostgreSQL Branch Promotion
  ├── 4. Redis Cluster Connection Binding (TLS required)
  ├── 5. Cloudflare R2 Production Bucket Policy Provisioning
  └── 6. Third-Party Penetration Test Engagement
```

---

## 3. Manual Deployment Operational Checklist

Prior to switching live student and faculty DNS traffic:

1. **DNS & Edge Protection:**
   * Configure apex and `www` DNS records on Cloudflare.
   * Enable Cloudflare WAF Managed Ruleset and DDoS protection (HTTP flood rate limiting).
   * Set SSL/TLS encryption mode to **Full (Strict)**.
2. **Production Environment Variables:**
   * Generate fresh 256-bit random secrets for `JWT_SECRET` (`openssl rand -hex 32`).
   * Provision production Neon connection string with `sslmode=require`.
   * Configure production `REDIS_URL` with authentication password over TLS (`rediss://...`).
   * Set `ENVIRONMENT=production` in FastAPI to enforce HSTS headers and disable `/docs`.
3. **Storage & Cloudflare R2:**
   * Provision production private bucket `aimetra-prod-storage`.
   * Verify CORS configuration on R2 bucket to permit uploads only from the verified production origin.
4. **Monitoring & Observability:**
   * Inject production Sentry DSN into backend runtime.
   * Configure uptime heartbeat monitoring (e.g., BetterStack / Uptime Kuma) targeting `/api/v1/health/live`.
5. **Institutional Onboarding:**
   * Seed initial Super Admin and HOD accounts via `seed_hod.py`.
   * Validate faculty directory and academic curriculum with department leadership.
   * Schedule annual third-party external penetration testing.
