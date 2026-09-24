# /pen-test — Penetration Testing (Internal)

## Steps

1. **@security-appsec** + **@security-infra** coordinate.
2. Enumerate attack surface (endpoints, ports, services).
3. Test OWASP Top 10 against each endpoint.
4. Test auth bypass, IDOR, privilege escalation.
5. Test rate limiting, input validation.
6. Test file upload security.
7. Test AI endpoints for prompt injection.
8. Document findings with repro steps.

## Rules

- Only test on staging, never on production without approval.
- No DoS attacks (unless explicitly authorized).
- No social engineering.
- Document everything.
- Report critical findings immediately.

## Output

- Pen-test report with findings by severity.
- Reproduction steps for each finding.
- Remediation recommendations.
