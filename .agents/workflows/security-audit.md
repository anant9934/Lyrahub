# /security-audit — Full Security Audit

## Steps

1. Invoke **@security-threat-model** to update `THREAT_MODEL.md`.
2. Invoke **@security-appsec** to audit all application code.
3. Invoke **@security-infra** to audit infrastructure + Docker + CI/CD.
4. Invoke **@security-data** to audit data handling, PII, backups.
5. Invoke **@security-ai** to audit chatbot, RAG, and model access.
6. Invoke **@security-compliance** to audit GDPR/DPDP/WCAG.
7. Invoke **@security-incident** to verify incident response readiness.
8. **@security** consolidates findings into `SECURITY_POSTURE.md`.

## Output

- `SECURITY_POSTURE.md` — overall score + findings by severity.
- `THREAT_MODEL.md` — updated.
- `COMPLIANCE_MATRIX.md` — updated.
- Critical findings escalated to human immediately.

## Rules

- Every finding includes file path, line, impact, repro, fix.
- No finding is dismissed without written justification.
- Critical findings block deployment.
- Human approves remediation plan.
