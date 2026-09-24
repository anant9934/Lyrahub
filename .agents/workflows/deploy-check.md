# /deploy-check — Pre-Deployment Validation

## Steps

1. Invoke **@qa** to run full test suite.
2. Invoke **@devops** to verify:
   - All env vars present (compare with `.env.example`).
   - No secrets in Git (`git secrets --scan`).
   - Docker builds succeed.
   - Migrations apply cleanly on a fresh DB.
   - Health checks respond (`/health/live`, `/health/ready`, `/health/deep`).
   - Backups are configured.
   - Monitoring is active.
3. Report **go/no-go** recommendation with evidence.

## Rules

- If any check fails, report NO-GO.
- List every failed check with severity.
- Provide remediation steps for each failure.
- Do NOT deploy automatically — human approves.

---
