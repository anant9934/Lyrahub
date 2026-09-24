---
name: security-appsec
description: Enforces application security — OWASP Top 10, input
  validation, auth, RBAC, secure APIs, file uploads, and error handling.
  Use when reviewing or writing application code, APIs, or auth flows.
---

# Application Security (AppSec)

## When to use this skill
- Reviewing any new endpoint, API, or business logic.
- Auditing authentication and authorization flows.
- Reviewing file upload, form submission, or user input handling.
- Checking for OWASP Top 10 vulnerabilities.
- Enforcing security headers and cookie policies.

## OWASP Top 10 (2021) — Mandatory Checks

| # | Risk | Check |
|---|------|-------|
| A01 | Broken Access Control | Every endpoint has RBAC check |
| A02 | Cryptographic Failures | No MD5/SHA1, Argon2id for passwords, TLS 1.3 |
| A03 | Injection | Parameterized queries, no raw SQL, no eval |
| A04 | Insecure Design | Threat model exists, defense in depth |
| A05 | Security Misconfiguration | No default creds, minimal services, hardened |
| A06 | Vulnerable Components | No known CVEs, dependencies audited |
| A07 | Auth Failures | MFA for admin, rate limiting, lockout |
| A08 | Data Integrity Failures | Signed tokens, verified webhooks |
| A09 | Logging Failures | All auth events logged, no PII in logs |
| A10 | SSRF | No user-controlled URLs to backend |

## Input Validation Rules

1. Every input validated with Pydantic (backend) or Zod (frontend).
2. Reject unexpected fields (strict mode).
3. Length limits on all strings.
4. Regex validation on structured fields (email, phone, reg_no).
5. File uploads: validate MIME, size, content hash.
6. No raw SQL — always parameterized queries via ORM.
7. No `eval()`, no `exec()`, no `subprocess` with user input.
8. Escape output in HTML contexts (React handles this).

## Authentication Rules

1. Passwords hashed with Argon2id (not bcrypt, not PBKDF2).
2. JWT access token: 15 min. Refresh: 7 days.
3. Refresh tokens stored in Redis with sliding expiration.
4. Logout blacklists refresh token immediately.
5. Failed login: track per IP + per email. Lockout after 5 in 15 min.
6. Password policy: min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol.
7. No password hints, no security questions.
8. MFA (TOTP) required for Admin, HOD.
9. Session limit: 3 concurrent devices.
10. JWT stored in httpOnly, Secure, SameSite=Strict cookie.

## Authorization Rules

1. Every protected endpoint uses `Depends(get_current_user)`.
2. Every resource access checks ownership or scope.
3. RBAC enforced at middleware, not just in route handler.
4. Scope checks: `own`, `mentees`, `section`, `department`, `global`.
5. Deny overrides allow (if any role denies, block).
6. Admin actions logged with actor_id.
7. IDOR prevention: never expose sequential IDs in URLs where
   access control matters — use UUIDs for public resources.

## API Security

1. Rate limiting per user + per IP.
2. Request size limits (10 MB default, 50 MB uploads).
3. CORS: allow only known origins, no `*` in production.
4. CSRF: tokens on state-changing requests.
5. Security headers (via Caddy/Cloudflare):
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy: default-src 'self'`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(self), microphone=(self)`
6. No version info in headers (`Server`, `X-Powered-By` removed).
7. Health endpoints (`/health/*`) do not leak internal state.

## File Upload Security

1. Validate MIME type server-side (magic bytes, not just extension).
2. Allowed types: PDF, DOCX, XLSX, PPTX, JPG, PNG, MP4, ZIP.
3. Max size: 50 MB.
4. Virus scan (ClamAV) — Phase 3.
5. Store in R2 with signed URLs (15 min expiry).
6. Never serve uploads from same domain as app (use R2 CDN).
7. Strip EXIF metadata from images.
8. Rename files (never trust original filename).
9. Content hash for deduplication.
10. Log every upload with actor_id, file_id, size, hash.

## Error Handling Rules

1. Never leak stack traces to client.
2. Use RFC 7807 Problem Details format.
3. Log full error server-side with request_id.
4. Return generic message to client (e.g., "Invalid credentials").
5. No timing differences between "user exists" and "user doesn't" for login.

## Logging Rules

1. Log all auth events (login, logout, failed attempts, password change).
2. Log all admin actions (role changes, permission changes, deletions).
3. Log all data exports (who, what, when).
4. Log all file uploads/downloads.
5. NEVER log passwords, tokens, or PII.
6. Log format: JSON, structured, with request_id, actor_id, timestamp.
7. Logs immutable (append-only).
8. Retention: 7 years for audit logs, 30 days for debug logs.

## Anti-Patterns (NEVER)

- ❌ Raw SQL string concatenation
- ❌ `eval()` or `exec()` on user input
- ❌ Storing JWT in localStorage
- ❌ Trusting client-side validation alone
- ❌ Returning stack traces
- ❌ Logging PII
- ❌ Hardcoded secrets
- ❌ Sequential IDs in public URLs
- ❌ Wildcard CORS in production
- ❌ No rate limiting on login

## Audit Output Format

For each finding:
```
[SEVERITY] Category — Title
File: path/to/file.py:42
Issue: Description
Impact: What can go wrong
Repro: Steps to reproduce
Fix: Recommended remediation
```
