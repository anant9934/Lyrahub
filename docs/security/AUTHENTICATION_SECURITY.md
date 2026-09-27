# AIMETRA — Authentication Security Specification

This document details the authentication architecture, credential hardening, and brute-force defenses implemented in AIMETRA.

---

## 1. Authentication Flows

### 1.1 Login Flow
1. Client submits email and password over TLS to `/api/v1/auth/login`.
2. Backend queries user record by email.
3. Password verified using Argon2id (`verify_password`).
4. If authentication fails:
   * Generic error returned: `HTTP 401: Invalid credentials`.
   * Failed attempt counter incremented in Redis.
5. If authentication succeeds:
   * Failed attempt counter cleared.
   * Short-lived Access Token generated (15m TTL).
   * Cryptographically random Refresh Token generated (7d TTL).
   * Returns tokens in response payload or sets `HttpOnly`, `Secure` cookies.

### 1.2 Refresh Flow
1. Client presents refresh token to `/api/v1/auth/refresh`.
2. Token signature and expiry verified.
3. Token existence checked against Redis revocation list.
4. Old refresh token is invalidated, and a new access token + rotated refresh token are issued.

### 1.3 Logout Flow
1. Client issues request to `/api/v1/auth/logout`.
2. Active access and refresh token IDs (`jti`) written to Redis blacklist with TTL equal to token remaining lifetime.
3. Client cookies cleared.

---

## 2. Password Security & Storage

* **Primary Algorithm:** Argon2id (memory-hard, resistant to GPU/ASIC cracking).
* **Per-User Salt:** Automatically generated 128-bit cryptographically secure random salt embedded in the Argon2id hash output.
* **Plaintext Storage Prohibition:** No plaintext or reversibly encrypted passwords are ever stored.
* **Log Sanitization:** Sensitive fields (`password`, `current_password`, `token`, `secret`) are explicitly stripped by logging filters.
* **API Exposure Prevention:** `hashed_password` field is excluded from all Pydantic response models (`UserResponse`, etc.).

---

## 3. Brute Force & Credential Stuffing Defenses

* **Threshold:** 5 failed attempts per 15-minute sliding window per IP and per account.
* **Progressive Delay:** Exponential backoff applied to subsequent responses after 3 failures.
* **Lockout Behavior:** Temporary 15-minute lock upon exceeding threshold to prevent high-speed dictionary attacks.
* **Admin Alerting:** Notification triggered when an account exceeds failed attempt thresholds repeatedly.

---

## 4. Account Enumeration Prevention

* **Uniform Responses:** Authentication and password reset endpoints return identical response structures and error codes regardless of whether the email exists in the database:
  * Login failure: `"Invalid email or password"`
  * Password reset request: `"If an account with that email exists, password reset instructions have been sent."`
* **Timing Attack Mitigation:** Constant-time verification prevents side-channel analysis based on response latency differences between existing and non-existing accounts.

---

## 5. Multi-Factor Authentication (MFA / TOTP)

* **Privileged Roles:** Mandatory for HOD, Admin, and Super Admin accounts.
* **Algorithm:** Standard RFC 6238 TOTP (Time-Based One-Time Password) with HMAC-SHA1 and 30-second window.
* **Server-Side Verification:** The browser or client never decides whether MFA has been satisfied. A temporary session token (`mfa_pending`) is issued until the 6-digit TOTP code is validated against the server secret.
* **Code Replay Protection:** Used TOTP tokens are recorded in Redis with a 90-second TTL to prevent code reuse within the same validity window.
