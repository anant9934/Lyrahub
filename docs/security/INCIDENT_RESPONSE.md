# AIMETRA — Incident Response & Breach Runbook

This document defines the protocols, escalation paths, and rapid-action runbooks for handling cybersecurity incidents, data breaches, and credential compromise.

---

## 1. Incident Response Lifecycle

```
[ 1. Detection & Triage ]
           │
           ▼
[ 2. Immediate Containment ]
           │
           ▼
[ 3. Threat Eradication ]
           │
           ▼
[ 4. Clean System Recovery ]
           │
           ▼
[ 5. Root Cause Investigation ]
           │
           ▼
[ 6. Stakeholder Communication ]
           │
           ▼
[ 7. Blameless Postmortem ]
```

---

## 2. Emergency Breach Runbooks

### Runbook 1: Database Credentials Compromised
1. **Immediate Containment:**
   * Access the Neon management console immediately.
   * Reset database password for the application user.
   * Terminate all active database connections from the console.
2. **Eradication & Recovery:**
   * Update `DATABASE_URL` in the deployment environment variables with the new password.
   * Trigger immediate rolling restart of FastAPI backend instances.
   * Verify read-only analytics credentials remain isolated.
3. **Investigation:**
   * Review PostgreSQL query and connection logs for unauthorized external IP connections or bulk exfiltration queries (`SELECT * FROM users`, etc.).

---

### Runbook 2: JWT Secret Key Compromised
1. **Immediate Containment:**
   * Generate a new cryptographically secure 256-bit random secret (`openssl rand -hex 32`).
   * Flush all active sessions in Redis (`FLUSHDB` on session cache or issue bulk invalidation).
2. **Eradication & Recovery:**
   * Deploy the new `JWT_SECRET` across all backend instances.
   * All existing user JWTs will immediately fail signature validation, terminating any attacker sessions and forcing legitimate users to re-authenticate.
3. **Investigation:**
   * Audit login and token creation logs around the timestamp of suspected compromise.

---

### Runbook 3: Cloud AI / Storage API Key Leaked
1. **Immediate Containment:**
   * Log into the provider console (Cloudflare, Groq, Mistral, Gemini).
   * Revoke and delete the compromised API key immediately.
2. **Eradication & Recovery:**
   * Generate a fresh API token with least-privilege permissions.
   * Update backend environment variables and redeploy.
3. **Investigation:**
   * Check provider usage metrics and billing logs to determine if token was abused for unauthorized inference or data extraction.

---

### Runbook 4: Admin Account Compromise
1. **Immediate Containment:**
   * Terminate active sessions for the compromised admin user via Redis blacklist.
   * Reset the user's password to an unpredictable value and temporarily set `is_active = False` in the database.
2. **Investigation & Audit:**
   * Query the `audit_logs` table filtering by the compromised admin's `user_id`:
     ```sql
     SELECT * FROM audit_logs WHERE user_id = 'COMPROMISED_ID' ORDER BY created_at DESC;
     ```
   * Revert any unauthorized role assignments, student status alterations, or system configurations made during the window of compromise.

---

### Runbook 5: Student PII Exposure Incident
1. **Immediate Containment:**
   * Isolate the affected endpoint or disable the route via Cloudflare WAF rule or application config.
2. **Investigation:**
   * Determine exact record count and student identities impacted.
   * Assess whether confidential academic records (grades, disciplinary notes) were accessed.
3. **Communication & DPDP Compliance:**
   * Prepare incident summary for the University Data Protection Officer (DPO) and institutional leadership.
   * If required under applicable data protection regulations, notify affected individuals within the required statutory window (e.g., 72 hours).
