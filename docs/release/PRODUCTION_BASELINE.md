# AIMETRA — Production Security Baseline

**Platform:** AIMETRA (AI & ML Education, Talent, Research & Analytics)  
**System Baseline Date:** September 27, 2026  
**Baseline Commit SHA:** `2c917bc449401264b26c2356456d71cae7272ccd`  
**State:** CODEBASE FROZEN — Pre-Deployment & Production Gate  

---

## 1. Environment & Stack Versions

| Component | Technology | Version |
|---|---|---|
| **Git Repository** | GitHub (`anant9934/Lyrahub`) | `main` (`2c917bc449401264b26c2356456d71cae7272ccd`) |
| **Frontend Framework** | Next.js (React 18.3.1) | `14.2.35` (App Router) |
| **Frontend Version** | `package.json` | `0.1.0` |
| **Node Runtime** | Node.js / npm | `v20.20.2` / `npm v10+` |
| **Backend Framework** | FastAPI (Python ASGI) | `0.111.0` |
| **Backend Version** | `app/main.py` | `1.0.0` |
| **Python Runtime** | CPython (Apple Darwin arm64) | `3.9.6` |
| **ORM / Data Access** | SQLAlchemy Async | `2.0.30` |
| **Cache / Key-Value** | Redis Python Client | `5.0.4` |
| **Database Engine** | PostgreSQL (Neon Cloud Serverless) | `16.x` with `pgvector` HNSW |
| **ASGI Server** | Uvicorn | `0.29.0` |

---

## 2. Test Execution Baseline

| Test Suite | File Scope | Tests Executed | Passed | Status |
|---|---|---|---|---|
| **Core Security Suite** | `tests/test_security.py` | 9 | 9 | ✅ PASSED |
| **Adversarial Suite** | `tests/test_adversarial_suite.py` | 12 | 12 | ✅ PASSED |
| **Combined Security Total**| `tests/test_security.py` + `tests/test_adversarial_suite.py` | **21** | **21** | ✅ PASSED |
| **AIDA Intelligence Suite**| `tests/test_phase5_aida.py` | 9 | 9 | ✅ PASSED |
| **Alumni & RBAC Suite** | `tests/test_alumni.py` | 7 | 7 | ✅ PASSED |
| **Domain Unit Suites** | `tests/*unit*.py` (Achievements, Events, Projects, QR, Tests, Stories, etc.) | 154 | 154 | ✅ PASSED |
| **Total Functional Tests** | Comprehensive verified backend tests | **191** | **191** | ✅ PASSED |

---

## 3. Frontend Compilation & Build Status

* **TypeScript Typecheck (`npx tsc --noEmit`):** ✅ **PASS** (0 errors).
* **Next.js Production Build (`npm run build`):** ✅ **PASS** (69/69 static routes compiled; 87.8 kB shared JavaScript).
* **Frontend Lint (`npm run lint`):** 🔴 **FAIL** (Exit code 1 on strict `@typescript-eslint/no-unused-vars` and `no-explicit-any`; non-blocking for security).

---

## 4. Dependency Security Audit Baseline

* **`npm audit` (Frontend):** 12 vulnerabilities (2 critical, 8 high, 2 moderate/low in Next.js 14 and `@xenova/transformers`).
* **`pip-audit` (Backend):** 51 CVE advisories across 13 transitive dependencies (`python-jose`, `starlette`, `urllib3`, `pillow`).

---

## 5. Known Accepted Risks

1. **Next.js 14 Image Optimizer / Cache Poisoning:**
   - Upgrading to Next.js 15/16 is a major breaking rewrite for App Router layout conventions.
   - Mitigated via Cloudflare WAF, strict image host allowlists, and static pre-rendering.
2. **`python-jose` Algorithm Confusion CVEs:**
   - Mitigated in application code via explicit algorithm pinning: `algorithms=["HS256"]`.
3. **`starlette` Multipart Boundary DoS:**
   - Mitigated by request size limits and `python-multipart` parsing constraints.

---

## 6. Known Manual Production Actions

1. **Cloudflare R2 Bucket Provisioning:** Private bucket creation, production CORS (`https://aimetra.edu`), and credentials injection.
2. **Neon Production Database Sync:** Run `alembic upgrade head` on production branch and enforce `sslmode=require`.
3. **Edge SSL & HSTS Termination:** Cloudflare Full (Strict) SSL/TLS with HSTS header enabled at CDN edge.
4. **Production Redis TLS:** Secure production Redis instance with `rediss://` protocol and strong authentication token.
