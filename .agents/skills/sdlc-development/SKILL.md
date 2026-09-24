---
name: sdlc-development
description: Phase 4 — Implement the design. Clean code, unit tests,
  frequent commits, code review. Use during implementation.
---

# SDLC Phase 4: Development

## When to use
- After design is approved.
- During implementation of user stories.

## Activities
- Follow all technical skills (fastapi, nextjs, database, etc.).
- Write unit tests as you code (not after).
- Commit frequently with clear messages.
- Push to feature branches.
- Open PRs for review.
- Address review comments.

## Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```
Types: feat, fix, docs, style, refactor, test, chore.

## PR Checklist
- [ ] All user stories implemented.
- [ ] Unit tests written and passing.
- [ ] Code follows skills.
- [ ] No secrets committed.
- [ ] Migrations included (if schema change).
- [ ] Documentation updated.
- [ ] Reviewed by @qa.
- [ ] Reviewed by @security.

## Exit Criteria
- [ ] All user stories implemented.
- [ ] Unit test coverage >80%.
- [ ] All tests pass.
- [ ] No critical security findings.
- [ ] Code reviewed and approved.

## Anti-Patterns
- ❌ Committing without tests
- ❌ Large PRs (>500 lines)
- ❌ Secrets in code
- ❌ Ignoring review comments
- ❌ No documentation
