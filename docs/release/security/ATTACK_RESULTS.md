# AIMETRA — Adversarial Attack Simulation Results

This document provides granular technical logs for simulated adversarial attacks executed against AIMETRA.

---

### Attack 1: JWT Signature Bypass via `alg: none`
* **Control:** Cryptographic signature enforcement and algorithm pinning to `HS256`.
* **Threat:** Impersonation of super-administrator without possession of server secret.
* **Test:** Manually construct token with base64 encoded header `{"typ": "JWT", "alg": "none"}` and payload `{"sub": "attacker@evil.com", "role": "Super Admin"}`.
* **Command / Procedure:**
  ```python
  unsigned_token = f"{header_b64}.{payload_b64}."
  jwt.decode(unsigned_token, settings.JWT_SECRET, algorithms=["HS256"])
  ```
* **Expected Result:** `jose.exceptions.JWTError` raised.
* **Observed Result:** `jose.exceptions.JWTError` raised immediately.
* **Status:** ✅ **VERIFIED**
* **Evidence:** `tests/test_adversarial_suite.py::test_jwt_alg_none_rejection PASSED`.
* **Remediation:** Pinned `algorithms=["HS256"]` in all JWT decode operations.

---

### Attack 2: JWT Role Privilege Escalation Tampering
* **Control:** Cryptographic HMAC-SHA256 signature verification.
* **Threat:** Student user tampering with their bearer token in transit to claim `Admin` role.
* **Test:** Modify token payload bytes from `"role": "Student"` to `"role": "Admin"` while preserving original signature.
* **Expected Result:** Token rejected with signature mismatch.
* **Observed Result:** Rejected with `jose.exceptions.JWTError: Signature verification failed`.
* **Status:** ✅ **VERIFIED**
* **Evidence:** `tests/test_adversarial_suite.py::test_jwt_tampered_role_privilege_escalation PASSED`.

---

### Attack 3: Path Traversal on File Storage (POSIX & Windows Separators)
* **Control:** Path normalization (`key.replace('\\', '/')`) and `os.path.realpath()` boundary checking against `storage.root_dir`.
* **Threat:** Directory escape leaking sensitive server credentials or system files (`/etc/passwd`).
* **Test:** Submit traversal sequences: `../../etc/passwd`, `..\..\windows\system32`, `sub/../../../../root_secret.txt`.
* **Expected Result:** Target path resolves outside `storage.root_dir` and raises `HTTP 400 Bad Request`.
* **Observed Result:** `test_path_traversal_directory_escape PASSED`. All traversal attempts trapped.
* **Status:** ✅ **VERIFIED**
* **Remediation:** Added `normalized_key = key.replace("\\", "/")` in `backend/app/modules/files/router.py`.

---

### Attack 4: AI Adversarial Prompt Injection & Jailbreaking
* **Control:** Interceptor regex filter `_detect_prompt_injection` in `backend/app/modules/ai/router.py`.
* **Threat:** Attacker bypasses institutional guidelines using DAN mode, system prompt reveal, or embedded destructive SQL commands.
* **Test:** Attack `/api/v1/ai/query` with 9 adversarial payload variants.
* **Expected Result:** Interceptor catches all adversarial variants and returns `HTTP 400 Bad Request`.
* **Observed Result:** `test_prompt_injection_comprehensive_matrix PASSED`. All 9 attacks caught; benign academic queries unaffected.
* **Status:** ✅ **VERIFIED**

---

### Attack 5: Mass Assignment of Administrative Privileges
* **Control:** Strict Pydantic input schemas (`StudentProfileUpdateRequest`).
* **Threat:** Attacker injects `"role": "Super Admin"`, `"is_admin": true`, or `"ranking_score": 100.0` into profile update JSON.
* **Test:** Submit malicious fields in request body; inspect parsed model dump.
* **Expected Result:** Pydantic model strips unmapped fields; privileged attributes never passed to database.
* **Observed Result:** `test_mass_assignment_tampering_fields PASSED`.
* **Status:** ✅ **VERIFIED**

---

### Attack 6: Casbin RBAC Unauthorized Elevation
* **Control:** Casbin AsyncEnforcer deny-by-default rule (`e = some(where (p.eft == allow))`).
* **Threat:** Direct invocation of administrative endpoints (`/roles`, `/audit-logs`, `/users`) by unprivileged students.
* **Test:** Evaluate permission checks for student user across administrative resources.
* **Expected Result:** `enforce()` returns `False`. Request terminates with `HTTP 403 Forbidden`.
* **Observed Result:** `test_casbin_rbac_unauthorized_elevation PASSED`.
* **Status:** ✅ **VERIFIED**
