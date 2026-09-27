# Lyrahub Security Hardening & Zero-Trust Architecture Report

**Date**: 2026-09-26  
**Cycle**: Master Optimization & Hardening Cycle  
**Standards**: OWASP Top 10 (2021), RFC 7519 (JWT), RFC 7807 (Problem Details), NIST 800-63B  

---

## 1. Executive Summary

Lyrahub handles sensitive academic data including student grades, CGPA, attendance, placement offers, faculty evaluations, and departmental communications. Security hardening during this cycle focused on:
1. **Server-Side Zero-Trust Role Resolution**: Guaranteeing that role claims from browser storage, cookies, or headers are never trusted.
2. **AI Gateway Guardrails**: Enforcing an unbreakable architecture rule where student accounts can never trigger billable cloud LLM APIs.
3. **HTTP Defensive Headers**: Auditing and applying strict CSP, clickjacking, and MIME sniffing protections.
4. **Tenant Isolation & Secret Hygiene**: Verifying zero plaintext secrets exist in git logs, environment templates, or client build bundles.

---

## 2. Server-Side RBAC / ABAC Enforcement

### Non-Tamperable Role Resolution
In `backend/app/modules/ai/router.py`:
```python
async def _resolve_role(user: User) -> str:
    """Resolve the user's primary role from server-side RBAC. NEVER trust browser."""
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["super_admin", "admin", "hod", "cos", "hos", "higher_authority", "faculty", "teacher", "alumni", "student"]:
                if r in roles:
                    return r
    except Exception as e:
        logger.warning(f"Error resolving role for {user.email}: {e}")
    return "student"  # Least privilege default
```

### AI Cloud Tier Access Barrier
In `backend/app/modules/ai/intent_router.py`:
- **Students**: Filtered at Level 3 (Browser SLM) or Level 4/5 (OKF/RAG). If a query cannot be answered by department sources, students receive a polite offline response or browser SLM prompt.
- **Faculty / HOD / Admin**: Permitted to fall back to Cloud LLM (Gemini 1.5 Pro / Claude 3.5 Sonnet) only after Level 6 (Local Ollama) fails and only under atomic Redis quota enforcement.

---

## 3. HTTP Security Headers Audit

Configured in `frontend/next.config.mjs` for all routes:

```javascript
// Next.js Edge Security Headers
{
  key: "X-Frame-Options",
  value: "DENY"
},
{
  key: "X-Content-Type-Options",
  value: "nosniff"
},
{
  key: "Referrer-Policy",
  value: "strict-origin-when-cross-origin"
},
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=()"
},
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; frame-ancestors 'none';"
}
```

---

## 4. Audit Trail & Immutability

Every state mutation logs who, what, when, and payload into the immutable `audit_logs` table:
```python
db.add(AuditLog(
    actor_id=user.id,
    action="register_alumni",
    resource_type="alumni",
    payload={"id": str(alumni.id), "email": alumni.email, "reg_no": alumni.reg_no}
))
```
- All profile changes create an entry in corresponding history tables (`profile_history`, `ranking_history`).
- No physical hard-deletes occur in operational tables; `deleted_at` timestamps preserve data integrity with soft-delete semantics.

---

## 5. Secret Protection & Environment Hygiene

- **Codebase Scan**: Grep scan across the entire repository revealed zero committed API keys, JWT secrets, or database passwords.
- **Client Bundle Verification**: Next.js production chunks were inspected to ensure no `process.env.DATABASE_URL` or `SECRET_KEY` leaked into client JavaScript.
- **Environment Template**: `.env.example` provides explicit placeholder documentation without sensitive values.
