# /security-review — Pre-Merge Security Review

## Steps

1. **@security** assigns relevant sub-agents based on changes.
2. If code changes → @security-appsec.
3. If infra changes → @security-infra.
4. If data changes → @security-data.
5. If AI changes → @security-ai.
6. If new data type → @security-compliance.
7. All findings aggregated and reported.

## Rules

- No PR merges without @security sign-off.
- Critical findings block merge.
- High findings require mitigation plan.
- Medium findings tracked in backlog.
- Low findings accepted or documented.

## Output

- Security review report.
- Sign-off (approve / block with reasons).
- Findings with severity and remediation.
