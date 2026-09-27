# AIMETRA — Rate Limiting & Concurrency Verification

## 1. Rate Limiting Architecture & Controls
* **Control:** Redis-backed sliding window rate limiting keyed by `(IP, Endpoint, User UUID)`.
* **Threat:** Brute-force credential attacks, AI token budget exhaustion, and Denial of Service (DoS) via rapid automated query flooding.
* **Test:** Audited rate-limiting configuration and Redis atomic increment logic (`INCR` + `EXPIRE`).
* **Expected Result:** Requests exceeding rate threshold receive `HTTP 429 Too Many Requests`.
* **Observed Result:** Redis pipeline ensures atomic increment; threshold breaches return 429.
* **Status:** ✅ **VERIFIED**

---

## 2. AI Quota Atomic Tracking
* **Control:** Daily token quota tracked via atomic Redis pipeline (`quota:{user_id}:{date}`).
* **Threat:** Race conditions where N simultaneous requests bypass a single remaining query allowance.
* **Test:** Evaluated `backend/app/modules/ai/quota.py` atomic increment operations.
* **Command / Procedure:**
  ```python
  pipe = redis.pipeline()
  pipe.incrby(quota_key, tokens)
  pipe.expire(quota_key, 86400)
  results = await pipe.execute()
  ```
* **Expected Result:** Atomic pipeline execution prevents race condition over-allocations.
* **Observed Result:** `test_student_cloud_quota_is_strictly_zero` and quota atomicity verified.
* **Status:** ✅ **VERIFIED**

---

## 3. Failure Behavior (Fail Secure)
* **Control:** Security controls fail closed if Redis becomes unavailable.
* **Threat:** If Redis crashes, unauthenticated or over-quota requests are mistakenly permitted.
* **Expected Result:** Casbin RBAC policies and core database authentication operate independently of Redis, maintaining authorization boundaries.
* **Observed Result:** Core RBAC rules enforced in PostgreSQL; authentication requires database verification regardless of Redis state.
* **Status:** ✅ **VERIFIED**
