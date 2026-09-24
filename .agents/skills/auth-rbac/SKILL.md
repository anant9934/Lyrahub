---
name: auth-rbac
description: Implements JWT authentication and dynamic RBAC with Casbin.
  Use when writing login, signup, permissions, role management, or
  approval workflows.
---

# Auth & Dynamic RBAC

## When to use this skill
- Writing authentication (login, signup, refresh, logout).
- Implementing role-based access control.
- Creating dynamic roles and permissions.
- Building approval workflows.

## Authentication Rules

1. JWT access token: **15-minute** expiry.
2. JWT refresh token: **7-day** expiry.
3. Refresh tokens stored in Redis with sliding expiration.
4. Logout blacklists refresh token in Redis (TTL = remaining token life).
5. Passwords hashed with **Argon2id**.
6. All protected endpoints use `Depends(get_current_user)`.
7. MFA (TOTP) required for admin accounts.
8. Session limit: 3 concurrent devices per user.
9. Failed login attempts tracked; lockout after 5 failures in 15 min.
10. Password policy: min 8 chars, 1 uppercase, 1 number, 1 symbol.

## Dynamic RBAC Rules

1. Admin creates/edits roles at runtime via UI.
2. Permission format: **`module.action.scope`**
   - Examples: `student.view.all`, `student.edit.mentees`, `ranking.export.department`
3. Scope types: `global`, `department`, `section`, `course`, `mentees`, `own`.
4. Users can hold **multiple roles** with different scopes and expiry.
5. Casbin with Postgres adapter for policy storage.
6. Permissions cached in Redis (TTL 15 min, invalidated on change).
7. **Deny overrides allow** (if any role denies, action is blocked).

## Seed Roles

| Role | Key Permissions |
|------|-----------------|
| Admin | Everything |
| HOD | View all, approve, configure ranking, export |
| COS | View all, analytics, export |
| HOS | View all, analytics, export |
| Faculty | View/edit mentees (with approval), events, achievements |
| Staff | Data entry, view assigned |
| Student | View/edit own, take tests, upload docs |
| Alumni | Register, update own, view public pages |

## Permission Enforcement

Backend (FastAPI middleware):
```python
async def check_permission(user, action, resource):
    perms = await get_user_permissions(user.id)  # cached
    if action not in perms:
        raise HTTPException(403, "Forbidden")
    scope = await get_scope(user.id, action)
    if scope == "all":
        return True
    if scope == "mentees" and resource.mentor_id == user.id:
        return True
    if scope == "own" and resource.student_id == user.id:
        return True
    raise HTTPException(403, "Forbidden")
```

Frontend: hide UI elements user can't access (cosmetic only — backend is the real gate).

## Approval Workflow

Faculty submits change → HOD reviews → approve/reject with comments →
if approved, apply change + create version + notify faculty.
All steps logged in audit_logs.

## Edge Cases

- **Last admin** cannot be deleted or demoted.
- **Role deletion** requires reassigning all users.
- **Time-bound roles** auto-revoke via cron job.
- **Conflicting roles**: deny overrides.
- **Permission cache** invalidated immediately on role change.
- **Break-glass admin**: stored offline, used only in emergencies.

## Anti-Patterns (NEVER do these)
- ❌ Trusting frontend for permission checks
- ❌ Hardcoded roles in code
- ❌ Storing JWT in localStorage (use httpOnly cookie)
- ❌ Long-lived access tokens
- ❌ No rate limiting on login
- ❌ Plain text passwords

## Testing
- Unit tests for password hashing, JWT creation/validation.
- Integration tests for login, signup, refresh, logout.
- RBAC tests: allow/deny per role per action.
- Test expired token, invalid token, tampered token.
- Test concurrent login limit.

---
