# /startcycle — Full Development Cycle

## Steps

1. **@pm** reads the requirement and writes `Technical_Specification.md`.
2. **PAUSE** — wait for human approval. Do not proceed.
3. **@db** writes Alembic migrations + seed scripts (if schema changes).
4. **@engineer** implements backend + frontend per approved spec.
5. **@qa** writes and runs tests. Reports coverage + failures.
6. **@devops** writes Docker + env + README + deployment scripts.
7. **Report** summary: what was built, test results, how to run, next steps.

## Rules

- Follow every rule in `.agents/skills/`.
- PAUSE at step 2 — do not proceed without explicit human approval.
- If any agent hits ambiguity, PAUSE and ask the human.
- No agent may skip its step.
- If tests fail at step 5, return to step 4 (not step 3).
- If deployment fails at step 6, escalate to human.

## Output Artifacts

- `Technical_Specification.md` (from @pm)
- Migration files in `backend/alembic/versions/`
- Seed scripts in `backend/scripts/seeds/`
- Backend code in `backend/app/`
- Frontend code in `frontend/app/`
- Tests in `backend/tests/` and `frontend/tests/`
- `docker-compose.yml`, `.env.example`, `README.md`
- `TEST_REPORT.md` (from @qa)

---
