---
name: sdlc-analysis
description: Phase 2 — Decompose requirements into detailed specs, user
  stories, and traceability matrix. Use after planning.
---

# SDLC Phase 2: Analysis

## When to use
- After charter is approved.
- Before design begins.
- When requirements change.

## Deliverables
1. `USER_STORIES.md` — every FR as a user story with acceptance criteria.
2. `USE_CASES.md` — use case diagrams.
3. `DATA_REQUIREMENTS.md` — entities, attributes, relationships.
4. `INTERFACE_REQUIREMENTS.md` — APIs, UI, integrations.
5. `NFR_SPECS.md` — quantified non-functional requirements.
6. `RTM.md` — Requirements Traceability Matrix.

## User Story Format
```
As a [role],
I want [feature],
So that [benefit].

Acceptance Criteria:
- Given [context], when [action], then [outcome].
- ...
```

## Exit Criteria
- [ ] Every FR mapped to a user story.
- [ ] Every user story has acceptance criteria.
- [ ] NFRs are quantified (e.g., "p95 < 500ms").
- [ ] RTM complete (requirement → story → test).
- [ ] Human approves spec.

## Anti-Patterns
- ❌ Vague acceptance criteria
- ❌ Missing NFRs
- ❌ No traceability
- ❌ Skipping analysis ("we know the design")
