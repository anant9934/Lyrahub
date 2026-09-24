---
name: security-incident
description: Detects, contains, and recovers from security incidents.
  Use when responding to alerts, anomalies, breaches, or suspicious
  activity.
---

# Incident Response

## When to use this skill
- Any security alert fires.
- Anomaly detected in logs or metrics.
- User reports suspicious activity.
- Data breach suspected.
- System behavior deviates from baseline.

## Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P0** | Active breach, data loss, RCE | Immediate | Human + @security |
| **P1** | Auth bypass, privilege escalation | 15 min | Human + @security |
| **P2** | Suspicious activity, failed attacks | 1 hour | @security |
| **P3** | Vulnerability found (not exploited) | 24 hours | @security |
| **P4** | Minor issue, informational | 1 week | Next cycle |

## Incident Response Phases

### Phase 1: Detection
- Alert fires (Prometheus, Sentry, Uptime Kuma).
- Anomaly detected (unusual login, spike in 5xx).
- User report received.
- **Action**: Acknowledge, log, assign severity.

### Phase 2: Triage
- Assess scope: what systems affected?
- Assess impact: what data at risk?
- Assess attacker: internal/external? automated/targeted?
- **Action**: Document findings in `INCIDENTS.md`.

### Phase 3: Containment
- Isolate affected systems (network, disable accounts).
- Revoke compromised credentials.
- Block malicious IPs (Cloudflare).
- Disable compromised features.
- **Action**: Stop the bleeding.

### Phase 4: Eradication
- Identify root cause.
- Remove malware/backdoor.
- Patch vulnerability.
- Rotate all credentials.
- **Action**: Clean the system.

### Phase 5: Recovery
- Restore from clean backups.
- Verify system integrity.
- Monitor closely for reinfection.
- Gradually restore services.
- **Action**: Return to normal.

### Phase 6: Postmortem
- Blameless review within 5 days.
- Document: timeline, root cause, impact, response, lessons.
- Action items with owners and deadlines.
- Update threat model and runbooks.
- **Action**: Learn and improve.

## Detection Sources

1. **Prometheus alerts**: 5xx spike, latency spike, resource exhaustion.
2. **Sentry**: unusual error patterns.
3. **Auth logs**: failed login spike, login from new country.
4. **DB logs**: unusual queries, bulk exports.
5. **File logs**: unusual uploads, large downloads.
6. **AI logs**: prompt injection patterns, cost spikes.
7. **Network logs**: unusual outbound traffic.
8. **User reports**: suspicious emails, unexpected changes.

## Containment Playbook

### If auth bypass suspected
1. Disable affected endpoints.
2. Force logout all sessions.
3. Rotate JWT signing keys.
4. Audit all recent logins.
5. Notify affected users.

### If data breach suspected
1. Isolate DB (read-only mode).
2. Revoke all DB credentials.
3. Snapshot DB for forensics.
4. Identify scope (which records).
5. Notify DPO + legal.
6. Prepare breach notification (72 hrs GDPR).

### If RCE suspected
1. Isolate affected container.
2. Snapshot for forensics.
3. Rebuild from clean image.
4. Rotate all secrets.
5. Audit all commands run.

### If prompt injection suspected
1. Disable chatbot.
2. Review prompt logs.
3. Patch prompt hardening.
4. Rotate LLM access keys.
5. Re-enable after verification.

## Communication Plan

1. **Internal**: Slack/Discord channel for responders.
2. **Human owner**: notified for P0/P1 immediately.
3. **Affected users**: notified within 72 hrs for data breach.
4. **Regulator**: notified within 72 hrs (GDPR/DPDP).
5. **Public**: only if required by law or PR.

## Evidence Preservation

1. Snapshot affected systems.
2. Preserve logs (don't delete).
3. Document timeline with timestamps.
4. Hash evidence files for integrity.
5. Chain of custody documented.
6. No tampering with evidence.

## Postmortem Template

```markdown
# Incident Postmortem: [ID]

## Summary
- Date: YYYY-MM-DD
- Severity: P0/P1/P2/P3/P4
- Duration: X hours
- Impact: What happened

## Timeline
- HH:MM — Event
- HH:MM — Detection
- HH:MM — Containment
- HH:MM — Recovery
- HH:MM — Resolution

## Root Cause
- Technical: What failed
- Process: What was missing
- Human: What decision led here

## Impact
- Users affected: N
- Data affected: Type, count
- Downtime: X hours
- Cost: ₹X

## Response
- What worked well
- What didn't
- What was lucky

## Action Items
- [ ] Fix X (owner, deadline)
- [ ] Update runbook Y (owner, deadline)
- [ ] Add monitoring Z (owner, deadline)

## Lessons
- Key takeaways
```

## Anti-Patterns (NEVER)

- ❌ Deleting logs during incident
- ❌ Blaming individuals
- ❌ Skipping postmortem
- ❌ No communication plan
- ❌ Delayed escalation
- ❌ Tampering with evidence
- ❌ No root cause analysis
- ❌ Repeating the same incident

## Audit Output Format

For each incident:
```
[SEVERITY] Incident — Title
Detected: Timestamp
Contained: Timestamp
Resolved: Timestamp
Root Cause: Description
Impact: Scope and cost
Action Items: List with owners
```
