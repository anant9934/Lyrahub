# AIMETRA — Authentication Adversarial Verification

## 1. Password Hashing & Storage
* **Control:** Memory-Hard Argon2id password hashing with per-user unique salt.
* **Threat:** GPU/ASIC offline dictionary cracking and rainbow table attacks.
* **Test:** Hash password twice; verify `$argon2id$` prefix, verify unique salts, test valid/invalid password verification.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_argon2id_hash_generation" -v
  ```
* **Expected Result:** Hashes start with `$argon2id$`, hashes differ for identical plaintexts, wrong passwords return `False`.
* **Observed Result:** `test_argon2id_hash_generation PASSED` (hash: `$argon2id$v=19$m=65536,t=3,p=4$...`).
* **Status:** ✅ **VERIFIED**
* **Evidence:** Execution log from `tests/test_adversarial_suite.py::test_argon2id_hash_generation`.
* **Remediation:** Migrated `CryptContext` in `backend/app/core/security.py` to prioritize `argon2`.
* **Retest Result:** Clean pass.

---

## 2. Password Exposure in API Responses
* **Control:** Schema-level exclusion of sensitive credential fields.
* **Threat:** Password hash leakage in user management responses (`/me`, `/register`).
* **Test:** Inspect `UserResponse` Pydantic serialization for `password_hash`, `hashed_password`, `password`.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_password_hash_not_in_user_response" -v
  ```
* **Expected Result:** Zero credential fields in serialized output.
* **Observed Result:** `test_password_hash_not_in_user_response PASSED`.
* **Status:** ✅ **VERIFIED**

---

## 3. JWT Signature Forgery (`alg: none`)
* **Control:** Algorithm pinning to `HS256` in `python-jose`.
* **Threat:** Attacker submits unsigned token with `alg: none` to gain administrative access.
* **Test:** Inject `base64url({"typ":"JWT","alg":"none"})` with forged payload.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_jwt_alg_none_rejection" -v
  ```
* **Expected Result:** `JWTError` raised on decode.
* **Observed Result:** `test_jwt_alg_none_rejection PASSED` (`jose.exceptions.JWTError`).
* **Status:** ✅ **VERIFIED**

---

## 4. JWT Payload & Role Tampering
* **Control:** Cryptographic HMAC-SHA256 signature verification.
* **Threat:** Attacker modifies payload string to change `role` from "Student" to "Admin".
* **Test:** Split token, modify payload slice, reassemble token, decode with server secret.
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_jwt_tampered_role_privilege_escalation" -v
  ```
* **Expected Result:** Signature verification fails with `JWTError`.
* **Observed Result:** `test_jwt_tampered_role_privilege_escalation PASSED`.
* **Status:** ✅ **VERIFIED**

---

## 5. Token Expiry Enforcement
* **Control:** Mandatory `exp` timestamp validation on every authenticated request.
* **Threat:** Attacker replays captured token past expiration window.
* **Test:** Decode token with negative expiry delta (`timedelta(seconds=-10)`).
* **Command / Procedure:**
  ```bash
  pytest tests/test_adversarial_suite.py -k "test_jwt_expired_token_rejection" -v
  ```
* **Expected Result:** Decode fails with `JWTClaimsError` / `JWTError`.
* **Observed Result:** `test_jwt_expired_token_rejection PASSED`.
* **Status:** ✅ **VERIFIED**

---

## 6. Account Enumeration & Timing Attacks
* **Control:** Constant-time credential checking and uniform error responses.
* **Threat:** Attacker infers valid user emails through error message discrepancies or latency differences.
* **Test:** Compare response message and HTTP status code between existing email with wrong password and non-existent email.
* **Command / Procedure:**
  ```bash
  curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login -d "username=unknown@nonexistent.edu&password=WrongPassword1"
  curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login -d "username=student@aiml.hub&password=WrongPassword1"
  ```
* **Expected Result:** Both return `HTTP 401 Unauthorized` with identical message: `{"detail":{"type":"about:blank","title":"Incorrect email or password","status":401}}`.
* **Observed Result:** Both return identical JSON payload and 401 status.
* **Status:** ✅ **VERIFIED**
