---
name: sdlc-design
description: Phase 3 — Architecture, data model, API contracts, UI, AI
  pipeline, threat model, cost model. Use after analysis.
---

# SDLC Phase 3: Design

## When to use
- After spec is approved.
- Before any code is written.
- When architecture changes.

## Deliverables
1. `ARCHITECTURE.md` — C4 diagrams, system design (via @architect).
2. `DATA_MODEL.md` — ER diagram, schema (via @architect-data).
3. `API_CONTRACTS.md` — OpenAPI spec (via @architect-api).
4. `UI_DESIGN.md` — wireframes, flows (via @architect-frontend).
5. `AI_PIPELINE.md` — RAG, SQL, inference (via @architect-ai).
6. `THREAT_MODEL.md` — STRIDE (via @security).
7. `COST_MODEL.md` — cost breakdown (via @cost).
8. `ADR/` — Architecture Decision Records.

## ADR Template
```
# ADR-001: [Title]
Date: YYYY-MM-DD
Status: Proposed / Accepted / Rejected / Superseded

## Context
What is the issue?

## Decision
What did we decide?

## Consequences
What becomes easier/harder?

## Alternatives Considered
What else did we evaluate?
```

## Exit Criteria
- [ ] Architecture diagram complete.
- [ ] API contracts frozen.
- [ ] Data model approved.
- [ ] Threat model reviewed.
- [ ] Cost impact assessed.
- [ ] ADRs written for significant decisions.
- [ ] Human approves design.

## Anti-Patterns
- ❌ Coding before design
- ❌ Missing ADRs
- ❌ Skipping threat model
- ❌ Ignoring cost impact
