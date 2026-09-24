---
name: sdlc-deployment
description: Phase 6 — Release to production safely. Pre-deploy checklist,
  backup, migrations, deploy, smoke test, monitor. Use for every release.
---

# SDLC Phase 6: Deployment

## When to use
- After testing is passed.
- For every production release.
- For hotfixes.

## Pre-Deploy Checklist
- [ ] All tests pass.
- [ ] Security review passed.
- [ ] Database backup taken.
- [ ] Migrations tested on staging.
- [ ] Environment variables set.
- [ ] Feature flags configured.
- [ ] Rollback plan documented.
- [ ] Monitoring ready.
- [ ] Release notes drafted.
- [ ] Human approved release.

## Deployment Order
1. Backup database.
2. Apply migrations (if any).
3. Deploy backend (Render).
4. Smoke test backend.
5. Deploy frontend (Vercel).
6. Smoke test frontend.
7. Verify critical flows.
8. Monitor for 24 hours.

## Rollback Plan
- Database: restore from backup.
- Backend: deploy previous commit.
- Frontend: revert Vercel deployment.
- Communicate to users.

## Post-Deploy
- Monitor error rate.
- Monitor latency.
- Monitor user feedback.
- Publish release notes.
- Update `CHANGELOG.md`.

## Exit Criteria
- [ ] Deployment successful.
- [ ] Smoke tests pass.
- [ ] Monitoring green for 24 hrs.
- [ ] Release notes published.

## Anti-Patterns
- ❌ Deploy on Friday
- ❌ No backup before migrations
- ❌ No rollback plan
- ❌ No smoke tests
- ❌ No monitoring
