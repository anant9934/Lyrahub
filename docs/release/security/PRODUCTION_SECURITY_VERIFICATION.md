# AIMETRA — Production Security & Deployment Infrastructure Verification

This document clearly distinguishes between controls verified locally in the test environment and controls requiring manual verification upon production deployment.

---

## 1. Verified Local Baseline vs. Production Deployment

| Security Control | Local Test Status | Production Deployment Status | Requirement for Live Activation |
|---|---|---|---|
| **Argon2id Hashing** | ✅ **VERIFIED** | ✅ **VERIFIED** | Active by default in `app/core/security.py`. |
| **JWT HS256 Validation** | ✅ **VERIFIED** | ✅ **VERIFIED** | Active by default. |
| **Casbin RBAC** | ✅ **VERIFIED** | ✅ **VERIFIED** | Active by default. |
| **Path Traversal Defense** | ✅ **VERIFIED** | ✅ **VERIFIED** | Active by default (`os.path.realpath` check). |
| **Prompt Injection Filter**| ✅ **VERIFIED** | ✅ **VERIFIED** | Active by default in `/api/v1/ai/query`. |
| **Security Headers** | ✅ **VERIFIED** | 🟡 **MANUAL ACTION** | `nosniff`, `DENY`, `strict-origin` active locally. HSTS header requires `ENVIRONMENT=production` on HTTPS domain. |
| **Cloudflare R2 Storage** | 🟢 **IMPLEMENTED** | 🟡 **MANUAL ACTION** | Local storage provider verified; R2 S3 provider requires verifying live bucket CORS and private ACL on Cloudflare console. |
| **Database TLS (Neon)** | 🟢 **IMPLEMENTED** | 🟡 **MANUAL ACTION** | Requires injecting production `DATABASE_URL` with `sslmode=require`. |
| **Redis TLS & Auth** | 🟢 **IMPLEMENTED** | 🟡 **MANUAL ACTION** | Requires injecting production `REDIS_URL` with TLS (`rediss://...`). |
| **Sentry Telemetry** | 🟢 **IMPLEMENTED** | 🟡 **MANUAL ACTION** | Requires configuring production `SENTRY_DSN` with client PII scrubbers. |
| **DNS & Cloudflare WAF** | ⚪ **N/A (LOCAL)** | 🟡 **MANUAL ACTION** | Requires delegating domain nameservers to Cloudflare and enabling WAF rulesets. |

---

## 2. Production Environment Variable Requirements

```ini
# Production Environment Flag (Enforces HSTS & disables interactive /docs)
ENVIRONMENT=production

# 256-bit Random Secret Key
JWT_SECRET=[32-BYTE-CRYPTOGRAPHIC-RANDOM-HEX]

# Production Database with Strict TLS
DATABASE_URL=postgresql+asyncpg://[USER]:[PASSWORD]@[PROD-HOST].neon.tech/aimetra?sslmode=require

# Authenticated Redis over TLS
REDIS_URL=rediss://default:[PASSWORD]@[PROD-REDIS-HOST]:6379/0

# Production Cloudflare R2 Credentials
R2_ENDPOINT_URL=https://[ACCOUNT_ID].r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=[KEY_ID]
R2_SECRET_ACCESS_KEY=[SECRET_KEY]
R2_BUCKET_NAME=aimetra-prod-storage

# Production Allowed Origins
CORS_ORIGINS=https://aimetra.institution.edu,https://www.aimetra.institution.edu
```
