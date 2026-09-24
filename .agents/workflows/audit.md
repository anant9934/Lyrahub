# /audit — Code & Security Audit

Invoke **@qa** and **@devops** jointly to audit the codebase.

## Audit Checklist

### Code Quality
- Anti-patterns in `.agents/skills/*` (sync DB calls, `any` types, missing indexes).
- Unused code, dead files, orphan migrations.
- Circular imports.
- Missing type hints.

### Security
- Secrets in Git history.
- SQL injection risks (raw SQL without params).
- Missing auth on endpoints.
- Weak password policy.
- Missing rate limiting.

### Performance
- N+1 queries.
- Missing indexes on hot paths.
- Unpaginated list endpoints.
- Synchronous blocking calls.

### Compliance
- NFR targets (response time, security, privacy).
- FR coverage (every FR has a test).
- Audit log coverage.

## Output

Report findings by severity:

- **Critical**: Fix immediately (security holes, data loss risks).
- **High**: Fix before next release.
- **Medium**: Fix in next sprint.
- **Low**: Nice to have.

For each finding: file path, line number, description, suggested fix.
