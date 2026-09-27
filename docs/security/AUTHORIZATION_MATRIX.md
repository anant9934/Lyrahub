# AIMETRA — Authorization Matrix & Scope Policy

This document defines the Role-Based Access Control (RBAC) and scope-aware access boundaries enforced across all AIMETRA endpoints and entities.

---

## 1. Zero-Trust Access Model

Every incoming request must satisfy the five-part security tuple:
```
Identity (User UUID)
  + Role (Casbin group)
  + Scope (Department / Section / Mentees / Own)
  + Resource (Target Entity)
  + Action (Read / Write / Delete / Approve)
```

No request is granted access based on client-claimed roles, hidden frontend views, or mere possession of a resource ID.

---

## 2. Institutional Roles & Hierarchy

1. **Student:** Standard student account. Can manage own profile, view public courses/events/projects, apply to opportunities, query AIDA via local SLM/tools.
2. **Faculty:** Academic instructor / mentor. Can view mentees, grade submissions, review student projects, publish events, query AIDA with departmental scope.
3. **HOD (Head of Department):** Department leadership. Can approve student achievements, assign mentors, view department-wide analytics, manage departmental knowledge docs.
4. **COS / HOS (Head of School):** Institutional multi-department oversight. Can view institutional reports and academic analytics.
5. **Admin:** Operational administrator. Can manage user roles, system configs, audit logs, and institutional taxonomies.
6. **Super Admin:** Master platform administrator. Root access for system-wide governance and disaster recovery.
7. **Alumni:** Former graduates. Can access alumni networking, post mentorship opportunities, view public department showcases.

---

## 3. Scope Hierarchy

| Scope | Permitted Access Boundary |
|---|---|
| `own` | Access restricted strictly to resources created by or assigned to the current user ID. |
| `mentees` | Access restricted to students formally assigned to the faculty member via mentorship relations. |
| `section` | Access restricted to academic sections (e.g., AI-A, AI-B) assigned to the instructor. |
| `department` | Access restricted to entities belonging to the user's academic department (e.g., Dept of AI & ML). |
| `institution` | Read-only or aggregated access across all departments within the university. |
| `global` | System-wide administrative permissions. |

---

## 4. Endpoint Authorization Matrix

| Endpoint Path | HTTP Method | Allowed Roles | Enforced Scope | Audit Logged |
|---|---|---|---|---|
| `/api/v1/auth/me` | GET | All Authenticated | `own` | No |
| `/api/v1/students/{id}` | GET | Student (own), Faculty (mentees/dept), HOD, Admin | Scope-checked | No |
| `/api/v1/students/{id}` | PUT/PATCH | Student (own), Admin | `own` | Yes |
| `/api/v1/projects` | GET | All Authenticated | Public / Department | No |
| `/api/v1/projects` | POST | Student, Faculty | `own` | Yes |
| `/api/v1/projects/{id}` | PUT/DELETE | Owner, Faculty Mentor, Admin | `own` or `mentees` | Yes |
| `/api/v1/opportunities` | GET | All Authenticated | Public / Department | No |
| `/api/v1/opportunities` | POST | Faculty, HOD, Admin, Alumni | Department / Global | Yes |
| `/api/v1/opportunities/{id}/apply` | POST | Student | `own` (Unique constraint) | Yes |
| `/api/v1/files/upload/{key}` | POST | Student (own ID), Faculty, Admin | `own` prefix verified | Yes |
| `/api/v1/files/download/{key}` | GET | Owner, Assigned Mentor, HOD, Admin | `own` or privileged | Yes |
| `/api/v1/ai/query` | POST | All Authenticated | Scope-bound RAG | Yes |
| `/api/v1/ai/usage` | GET | All Authenticated | `own` (Admin = global) | No |
| `/api/v1/roles` | GET/POST | Admin, Super Admin | `global` | Yes |
| `/api/v1/audit-logs` | GET | Admin, Super Admin | `global` | No |
| `/api/v1/ranking/export` | GET | HOD, Admin, Super Admin | Department / Global | Yes |

---

## 5. IDOR & Privilege Escalation Defenses

* **IDOR Prevention:** Route handlers reject sequential integers. All student and entity identifiers use UUIDv4. Entity ownership is verified against `current_user.id` or mentorship linkage tables before retrieving or updating the record.
* **Vertical Privilege Escalation Defense:** Casbin RBAC acts as a mandatory gateway before any endpoint execution. Even if a student discovers an `/api/v1/roles` URL, Casbin enforces `p.eft == allow` and raises HTTP 403 Forbidden.
* **Horizontal Privilege Escalation Defense:** Multi-tenant departmental boundaries prevent Faculty in Department X from approving achievements or viewing private student resumes from Department Y.
