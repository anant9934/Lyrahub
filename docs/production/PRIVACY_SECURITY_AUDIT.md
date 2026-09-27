# AIMETRA — Privacy & Security Production Audit

**Scope:** Data Protection, DPDP Alignment, Transport Security, Session Management, Secret Isolation  
**Date:** September 2026  

---

## 1. Security Architecture & Header Enforcement

Verified via `next.config.mjs`:
- `X-Frame-Options: DENY` (Mitigates clickjacking attacks).
- `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing exploits).
- `Referrer-Policy: strict-origin-when-cross-origin` (Protects referrer data across outbound transitions).
- `Permissions-Policy: camera=(self), microphone=(), geolocation=()` (Restricts hardware peripherals to authorized on-campus QR badge scanning).
- `Content-Security-Policy`: Strictly defined script, style, font, image, and connect sources.

---

## 2. Secrets & Credential Audit

- **Environment Separation:** Zero production API keys, database credentials, or secret tokens committed to source code or git history.
- **Client Bundles:** Scanned frontend build bundles; no environment variables prefixed without `NEXT_PUBLIC_` are exposed to the client.
- **Database Access:** Backend database queries use parameterized SQLAlchemy queries and async sessions to prevent SQL injection.

---

## 3. Indian Data Protection (DPDP) Engineering Readiness

| DPDP Principle | Technical Implementation | Status |
|---|---|---|
| **Notice & Purpose Specification** | Dedicated `/privacy` policy page explicitly details student & faculty record usage | ✅ VERIFIED |
| **Data Minimization** | Only academic performance, project repositories, and attendance logs are processed | ✅ VERIFIED |
| **Storage Limitation & Auditing** | All profile modifications record historical changes to `*_history` audit tables | ✅ VERIFIED |
| **Grievance Redressal Mechanism** | Dedicated Institutional Data Protection Officer email provided at `privacy.aiml@institution.edu` | ✅ VERIFIED |
| **Legal Compliance Claim** | Explicitly labeled: *"Institutional charter implementation. Formal statutory DPDP certification requires institutional legal review."* | 🟡 REQUIRES MANUAL ACTION |

---

## 4. Role-Based Access Control (RBAC)

- Protected backend routes require `Depends(get_current_user)`.
- Critical write actions (student ranking modification, event creation, attendance validation) enforce role scopes (`student`, `faculty`, `hod`, `admin`).
- Unauthenticated requests to private dashboard routes automatically redirect to `/login`.
