# AIMETRA — Authorization & Access Control Verification

## 1. Casbin RBAC Deny-by-Default
* **Control:** Casbin AsyncEnforcer evaluating `e = some(where (p.eft == allow))`.
* **Threat:** Missing function-level authorization allowing unprivileged users to invoke administrative routes.
* **Test:** Execute enforce checks for `student@institution.edu` on `roles:create`, `audit_logs:read`, `users:delete`, `ranking_weights:write`.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_casbin_rbac_unauthorized_elevation" -v
  ```
* **Expected Result:** All unauthorized actions return `False`. Explicit admin policy grants access only to admin role.
* **Observed Result:** `test_casbin_rbac_unauthorized_elevation PASSED`.
* **Status:** ✅ **VERIFIED**

---

## 2. Insecure Direct Object References (IDOR)
* **Control:** Server-side ownership verification comparing authenticated session user UUID to target entity.
* **Threat:** Student A accesses or alters Student B's profile, grades, or documents by substituting UUIDs.
* **Test:** Issue request to `/api/v1/files/download/{key}` and `/api/v1/students/{id}` using credentials belonging to a different user.
* **Command / Procedure:**
  - Evaluated in `backend/app/modules/files/router.py`:
    ```python
    is_owner = key.startswith(student_id)
    is_admin = any(role in ["Admin", "HOD", "Faculty"] for role in user_roles)
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to download this file")
    ```
* **Expected Result:** `HTTP 403 Forbidden` returned for non-owners.
* **Observed Result:** Non-matching requests rejected with 403.
* **Status:** ✅ **VERIFIED**

---

## 3. Mass Assignment of Privileged Attributes
* **Control:** Strict Pydantic input schemas (`StudentProfileUpdateRequest`).
* **Threat:** Attacker injects `"role": "Super Admin"`, `"is_admin": true`, or `"ranking_score": 100` into JSON update payloads.
* **Test:** Instantiate `StudentProfileUpdateRequest` with malicious extra fields; dump model and inspect properties.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_mass_assignment_tampering_fields" -v
  ```
* **Expected Result:** Schema excludes `role`, `is_admin`, `verified`, `ranking_score`.
* **Observed Result:** `test_mass_assignment_tampering_fields PASSED`.
* **Status:** ✅ **VERIFIED**

---

## 4. Vertical Privilege Escalation
* **Control:** Multi-tier role separation enforced in database queries and Casbin middleware.
* **Threat:** Student accessing HOD or Dean moderation dashboards.
* **Test:** Send requests to `/api/v1/roles`, `/api/v1/audit-logs`, `/api/v1/ranking/export` using standard student bearer token.
* **Command / Procedure:**
  ```bash
  curl -s -X GET http://127.0.0.1:8000/api/v1/roles -H "Authorization: Bearer <STUDENT_TOKEN>"
  ```
* **Expected Result:** Rejected with `HTTP 403 Forbidden`.
* **Observed Result:** Endpoint returns 403.
* **Status:** ✅ **VERIFIED**
