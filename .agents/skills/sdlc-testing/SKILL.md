---
name: sdlc-testing
description: Phase 5 — Verify system meets requirements. Integration,
  e2e, performance, security, accessibility tests. Use before release.
---

# SDLC Phase 5: Testing

## When to use
- After development is complete.
- Before deployment.
- When bugs are reported.

## Test Types
| Type | Coverage | Tool |
|------|----------|------|
| Unit | >80% | pytest, vitest |
| Integration | All APIs | pytest + httpx |
| E2E | Critical flows | Playwright |
| Performance | p95 targets | k6, locust |
| Security | OWASP Top 10 | @security-appsec |
| Accessibility | WCAG 2.1 AA | axe-core |
| Load | 200 concurrent | k6 |

## Defect Tracking
- Log every defect in `DEFECTS.md`.
- Severity: Critical / High / Medium / Low.
- Critical and High block release.
- Every fix includes a regression test.

## Test Report Template
```
## Test Run: [Date]
- Total tests: N
- Passed: N (X%)
- Failed: N
- Coverage: X%

### Failures
- [Test name]: [Reason]

### Defects
- [ID]: [Severity] [Description]
```

## Exit Criteria
- [ ] All critical/high defects fixed.
- [ ] Test coverage >80%.
- [ ] Performance targets met.
- [ ] Security review passed.
- [ ] Accessibility passed.
- [ ] Human approves release.

## Anti-Patterns
- ❌ Skipping tests to ship faster
- ❌ Marking tests as flaky
- ❌ No regression tests
- ❌ Ignoring performance
