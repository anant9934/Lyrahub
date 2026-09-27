# AIMETRA — API EXPOSURE & ENDPOINT SECURITY MATRIX

**Audit Scope:** Complete Inventory of Backend API Routes  
**Total Endpoints Registered:** 163  
**Classification Breakdown:**
- **PUBLIC:** 25 routes (Intentionally unauthenticated: public catalog, alumni list, landing pages, login/register, system health)
- **AUTHENTICATED:** 126 routes (Authenticated user session: student portfolio, achievements, attendance scan, AI chat, personal tests)
- **ROLE-PROTECTED:** 12 routes (Administrative / Faculty: role management, verification, approvals, audit logs, system policy)

## PRINCIPLE OF ENDPOINT EXPOSURE

> **All sensitive/private API routes enforce server-side authentication and authorization. Public routes are intentionally unauthenticated and strictly return minimized public-safe DTOs.**

No debug, test, seed, or temporary endpoints are exposed to production.
FastAPI interactive documentation (/docs, /redoc, /openapi.json) is explicitly disabled when ENVIRONMENT=production.

## ROUTE INVENTORY

| Method | Endpoint | Public/Auth | Required Role | Scope | Sensitive Data | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/achievements` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/achievements` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/achievements/{id}/verify` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `POST` | `/api/v1/admin/roles` | ROLE-PROTECTED | Admin / HOD | Administration | Protected | VERIFIED |
| `GET` | `/api/v1/ai/admin/policy` | ROLE-PROTECTED | Admin / HOD | Administration | Protected | VERIFIED |
| `GET` | `/api/v1/ai/admin/usage` | ROLE-PROTECTED | Admin / HOD | Administration | Protected | VERIFIED |
| `GET` | `/api/v1/ai/admin/usage/logs` | ROLE-PROTECTED | Admin / HOD | Administration | Protected | VERIFIED |
| `GET` | `/api/v1/ai/health/models` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ai/knowledge/documents` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/ai/knowledge/index` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/ai/query` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ai/quota` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/alumni` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/alumni/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/alumni/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/alumni/me/experience` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/alumni/me/experience/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/alumni/mentors` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/alumni/register` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/alumni/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/alumni/{id}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `POST` | `/api/v1/alumni/{id}/verify` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `GET` | `/api/v1/approvals/history` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/approvals/requests` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/approvals/requests` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/approvals/requests/pending-count` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/approvals/requests/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/approvals/requests/{id}/approve` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `POST` | `/api/v1/approvals/requests/{id}/reject` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `POST` | `/api/v1/approvals/requests/{id}/withdraw` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/auth/login` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `POST` | `/api/v1/auth/logout` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/auth/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/auth/refresh` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `POST` | `/api/v1/auth/register` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/courses` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/courses` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/courses/code/{code}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/courses/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/courses/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/courses/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/courses/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/courses/{id}/faculty` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `POST` | `/api/v1/courses/{id}/faculty` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/courses/{id}/faculty/{faculty_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/courses/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/events` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/events` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/events/{event_id}/attendance/{student_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/events/{event_id}/feedback` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/events/{event_id}/publish` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/events/{event_id}/register` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/events/{id_or_slug}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/files/download/{key:path}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/files/upload/{key:path}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/groups` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/groups` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/groups/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/groups/official` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/groups/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/groups/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/groups/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/groups/{id}/events` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/groups/{id}/join` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/groups/{id}/join` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/groups/{id}/members` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/groups/{id}/members` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/groups/{id}/members/{student_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/groups/{id}/verify` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `GET` | `/api/v1/groups/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/health/live` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/health/ready` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/leadership` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `POST` | `/api/v1/leadership` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/leadership/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/leadership/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/leadership/{role}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/leadership/{role}/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/opportunities` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/opportunities` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/opportunities/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/opportunities/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/opportunities/upcoming` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/opportunities/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/opportunities/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/opportunities/{id}/applications` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/opportunities/{id}/applications/{student_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/opportunities/{id}/apply` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/opportunities/{id}/apply` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/opportunities/{id}/verify` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `GET` | `/api/v1/opportunities/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/programs` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/programs` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/programs/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/programs/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/programs/{id}/courses` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/programs/{id}/courses/{course_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/programs/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/projects` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/projects` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/projects/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/projects/mentor/{mentor_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/projects/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/projects/{id_or_slug}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/projects/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/projects/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/projects/{id}/documents` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/projects/{id}/documents` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/projects/{id}/members` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/projects/{id}/members/{student_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/qr/attendance/mark` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/qr/attendance/session` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/qr/attendance/session/{session_id}/records` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/qr/event/{event_id}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/qr/feedback/{context}/{context_id}` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/qr/student/{student_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ranking` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ranking/config` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PUT` | `/api/v1/ranking/config` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ranking/export` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/ranking/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/ranking/recalculate` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/skills` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `GET` | `/api/v1/stories` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/stories` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/stories/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/stories/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/stories/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/stories/{id}/feature` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/stories/{id}/publish` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/stories/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/students/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/students/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/students/me/resume/confirm` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/students/me/resume/presign` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/students/me/skills` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/students/me/skills/{skill_id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/students/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/testimonials` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/testimonials` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/testimonials/pending` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/testimonials/stats` | PUBLIC | None | Public Catalog | Public Safe | VERIFIED |
| `DELETE` | `/api/v1/testimonials/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/testimonials/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/testimonials/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/testimonials/{id}/approve` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `POST` | `/api/v1/testimonials/{id}/feature` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/testimonials/{id}/reject` | ROLE-PROTECTED | Faculty / Approver | Approval | Protected | VERIFIED |
| `GET` | `/api/v1/tests` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/tests/me` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/tests/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/tests/{id}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/tests/{id}/attempts` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests/{id}/generate-questions` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/tests/{id}/my-attempt` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests/{id}/publish` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests/{id}/questions` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `DELETE` | `/api/v1/tests/{id}/questions/{qid}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `PATCH` | `/api/v1/tests/{id}/questions/{qid}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests/{id}/start` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `POST` | `/api/v1/tests/{id}/submit` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |
| `GET` | `/api/v1/tests/{slug}` | AUTHENTICATED | Student / Faculty | User Access | Minimized DTO | VERIFIED |

## DATA MINIMIZATION VERIFICATION

1. **Public Endpoints:** Strictly return minimized public DTOs. Database sequence IDs, internal hashes, timestamps, and deleted flags are omitted.
2. **Authenticated Endpoints:** Restrict returned data to the requesting user session or approved peer records.
3. **Role-Protected Endpoints:** Enforce Casbin RBAC policies and token role claims. Unauthorized cross-role access attempts yield 403 Forbidden.
