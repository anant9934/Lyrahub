# AIMETRA — Security Test Suite & Regression Verification

This document documents the automated security tests implemented in AIMETRA, execution commands, and verified results.

---

## 1. Test Suite Architecture

The primary automated security test suite is located in:
```
backend/tests/test_security.py
```
This suite validates the core cryptographic, authorization, injection, and header defenses independently of mocking artifacts.

---

## 2. Test Specifications & Coverage

### 2.1 Cryptographic & Password Security
* **`test_argon2id_password_hashing`**
  * *Objective:* Verify that password hashing employs Argon2id (`$argon2id$`), generates unique random salts per user, verifies valid credentials, and rejects invalid passwords.
  * *Status:* **PASSED**

### 2.2 JWT Authentication & Tampering
* **`test_jwt_tampering_and_algorithm_confusion`**
  * *Objective:* Verify that modified JWT payloads, forged signatures, and unsigned tokens with `alg: none` are strictly rejected by the validator with `JWTError`.
  * *Status:* **PASSED**
* **`test_jwt_expiration`**
  * *Objective:* Verify that tokens with expired timestamps (`exp`) cannot be redeemed.
  * *Status:* **PASSED**

### 2.3 Injection & Adversarial AI Defenses
* **`test_prompt_injection_defense`**
  * *Objective:* Verify that overt prompt injection attempts ("Ignore previous instructions", "DAN mode", "Act as superadmin", "DROP TABLE users") are caught by `_detect_prompt_injection`, while legitimate academic queries pass without false positives.
  * *Status:* **PASSED**
* **`test_cache_user_isolation`**
  * *Objective:* Verify that identical queries submitted by different users or roles generate distinct cache keys to prevent cross-user data leakage.
  * *Status:* **PASSED**

### 2.4 File System & Path Traversal
* **`test_path_traversal_detection_logic`**
  * *Objective:* Verify that path traversal sequences (`../../etc/passwd`) fail `os.path.realpath()` boundary checks against the storage root directory.
  * *Status:* **PASSED**

### 2.5 Defense-in-Depth Security Headers
* **`test_security_headers_middleware`**
  * *Objective:* Inspect live ASGI responses to verify mandatory security headers:
    * `X-Content-Type-Options: nosniff`
    * `X-Frame-Options: DENY`
    * `Referrer-Policy: strict-origin-when-cross-origin`
    * `Permissions-Policy: camera=(self)...`
    * `X-XSS-Protection: 0`
    * `X-Request-ID`
  * *Status:* **PASSED**

### 2.6 Mass Assignment & Schema Validation
* **`test_mass_assignment_defense`**
  * *Objective:* Verify that Pydantic update schemas (`StudentProfileUpdateRequest`) reject or strip privilege escalation fields (`is_admin`, `role`, `ranking_score`, `verified`).
  * *Status:* **PASSED**

### 2.7 Casbin RBAC Deny-by-Default
* **`test_casbin_rbac_deny_by_default`**
  * *Objective:* Verify that Casbin denies any unregistered request by default (`p.eft == allow`) unless explicit matching policies exist.
  * *Status:* **PASSED**

---

## 3. Test Execution Command

To execute the automated security test suite:
```bash
cd backend
./venv/bin/pytest tests/test_security.py -v
```

### Verified Output:
```text
============================= test session starts ==============================
collected 9 items

tests/test_security.py::test_argon2id_password_hashing PASSED            [ 11%]
tests/test_security.py::test_jwt_tampering_and_algorithm_confusion PASSED [ 22%]
tests/test_security.py::test_jwt_expiration PASSED                       [ 33%]
tests/test_security.py::test_prompt_injection_defense PASSED             [ 44%]
tests/test_security.py::test_cache_user_isolation PASSED                 [ 55%]
tests/test_security.py::test_path_traversal_detection_logic PASSED       [ 66%]
tests/test_security.py::test_security_headers_middleware PASSED          [ 77%]
tests/test_security.py::test_mass_assignment_defense PASSED              [ 88%]
tests/test_security.py::test_casbin_rbac_deny_by_default PASSED          [100%]

======================== 9 passed, 26 warnings in 1.00s ========================
```
