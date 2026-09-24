# /incident-response — Respond to Active Incident

## Steps

1. **@security-incident** acknowledges and assigns severity (P0–P4).
2. Triage: scope, impact, attacker profile.
3. Containment: isolate, revoke, block.
4. Eradication: root cause, patch, rotate.
5. Recovery: restore, verify, monitor.
6. Postmortem within 5 days.
7. Update `INCIDENTS.md` and `THREAT_MODEL.md`.

## Escalation

- P0/P1 → human immediately.
- P2 → @security in same cycle.
- P3/P4 → next cycle.

## Output

- Incident report in `INCIDENTS.md`.
- Postmortem document.
- Action items with owners and deadlines.
