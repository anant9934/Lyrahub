# AIMETRA — Security Configuration Baseline

This document specifies the operational configuration standards and environment parameters enforcing Zero-Trust security across AIMETRA environments.

---

## 1. Authentication & Session Security

### Password Hashing
* **Algorithm:** Argon2id (`$argon2id$`)
* **Scheme Priority:** Argon2id primary, Bcrypt fallback for backward compatibility
* **Memory Cost:** 65536 KiB (64 MiB)
* **Time Cost (Iterations):** 3
* **Parallelism:** 4 lanes
* **Salt:** Cryptographically secure per-user random salt generated automatically by Argon2

### JWT Tokens
* **Algorithm:** HS256 (HMAC with SHA-256)
* **Minimum Secret Key Length:** 256 bits (32 bytes) cryptographically random string
* **Access Token TTL (`JWT_ACCESS_EXPIRY`):** 900 seconds (15 minutes)
* **Refresh Token TTL (`JWT_REFRESH_EXPIRY`):** 604,800 seconds (7 days)
* **Claims Validated:** `sub` (user UUID), `role` (primary role), `exp` (timestamp), `iat` (issued at)
* **Revocation Mechanism:** Redis blacklist keyed by token identifier upon explicit logout or role change

### Cookies
* **`HttpOnly`:** Enabled (prevents JavaScript access via `document.cookie`)
* **`Secure`:** Enabled in production (transmitted only over HTTPS)
* **`SameSite`:** `Lax` or `Strict` (prevents cross-site request forgery)

---

## 2. Network & Transport Security

### CORS (Cross-Origin Resource Sharing)
* **Wildcards:** `Access-Control-Allow-Origin: *` is strictly prohibited.
* **Credentials:** `allow_credentials=True` paired only with explicit origin allowlists:
  * Development: `http://localhost:3000`, `http://localhost:3001`
  * Production: Configured via `CORS_ORIGINS` environment variable (e.g., `https://aimetra.institution.edu`)
* **Allowed Methods:** `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`
* **Allowed Headers:** `["Authorization", "Content-Type", "X-Request-ID"]`
* **Exposed Headers:** `["X-Request-ID"]`

### Security Headers (FastAPI Middleware)
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
* `X-XSS-Protection: 0` (modern standard replacing legacy reflective XSS auditors)
* `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (enforced when `ENVIRONMENT=production`)

---

## 3. Storage & Upload Configuration

* **Maximum Upload Size:** 10 MB (`10 * 1024 * 1024` bytes)
* **Magic Byte Enforcement:** Uploaded files must match magic headers (`%PDF-` for PDFs)
* **Path Traversal Guard:** `os.path.realpath(target_path).startswith(os.path.realpath(storage.root_dir))`
* **Storage Isolation:**
  * Local Development: Partitioned subdirectories by user UUID.
  * Production (Cloudflare R2): Private bucket policy, pre-signed URLs with short 5-minute expiry.

---

## 4. AI & AIDA Engine Controls

* **Maximum Query Length:** 2,000 characters
* **Prompt Injection Defense:** Regex filter blocking system overrides, roleplay jailbreaks, and destructive SQL
* **Cache Key Isolation:** Hash generated from `user_id + role + mode + query`
* **Rate Limits & Quotas:**
  * Student Role: Local SLM / deterministic tools only (Cloud LLM denied)
  * Faculty / Admin: Daily quota tracked atomically via Redis keys (`quota:{user_id}:{date}`)

---

## 5. Database & Cache Security

* **Database Engine:** PostgreSQL with SSL mode required in production (`sslmode=require`)
* **ORM:** SQLAlchemy 2.0 async engine with parameterized queries only
* **Migrations:** Alembic version-controlled migrations with reversible down revisions
* **Redis Connection:** Authenticated with password, connection timeout set to 5 seconds
