---
name: sdlc-maintenance
description: Phase 7 — Keep system healthy. Monitoring, incidents,
  patches, feedback, next iteration. Use after deployment.
---

# SDLC Phase 7: Maintenance

## When to use
- After deployment.
- Continuously in production.
- When issues arise.

## Activities
### Daily
- Check uptime dashboard.
- Review error logs.
- Respond to alerts.

### Weekly
- Review user feedback.
- Triage bug reports.
- Apply dependency patches.

### Monthly
- Security audit (@security).
- Cost review (@cost).
- Performance review.
- Backup restore test.

### Quarterly
- Retrospective.
- Roadmap review.
- Technical debt assessment.
- Capacity planning.

## Incident Response
- Follow `skills/security-incident/SKILL.md`.
- P0/P1 → immediate escalation.
- Postmortem within 5 days.

## Continuous Improvement
- Track `TECH_DEBT.md`.
- Allocate 20% of each cycle to debt.
- Update documentation.
- Refactor hot spots.

## Next Iteration
- Groom backlog.
- Plan next cycle (@sdlc-plan).
- Update roadmap.

## Exit Criteria
- [ ] System stable.
- [ ] Backlog groomed.
- [ ] Next cycle planned.
- [ ] Retrospective completed.

## Anti-Patterns
- ❌ No monitoring
- ❌ Ignoring user feedback
- ❌ Never updating dependencies
- ❌ No retrospectives
- ❌ Ignoring technical debt
