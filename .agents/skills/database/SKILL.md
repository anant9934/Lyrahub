---
name: database-neon
description: Manages PostgreSQL schema on Neon with pgvector embeddings,
  Alembic migrations, indexing strategy, soft deletes, and versioning.
  Use when writing models, migrations, seeds, or SQL queries.
---

# Database Development (Neon + pgvector)

## When to use this skill
- Writing or modifying database models.
- Creating Alembic migrations.
- Writing seed scripts.
- Optimizing queries or adding indexes.
- Designing versioning or soft-delete logic.

## Core Rules

1. Use **Alembic** for ALL schema changes. Never modify DB manually.
2. Connection string from `DATABASE_URL` env var.
3. Use **async SQLAlchemy** engine with **asyncpg** driver.
4. ALL tables have: `id`, `created_at`, `updated_at`, `deleted_at` (soft delete).
5. ALL profile tables have `*_history` siblings with: `valid_from`, `valid_to`,
   `changed_by`, `approved_by`.
6. NEVER `DELETE` — set `deleted_at = now()`.
7. Every migration has a working `downgrade()` function.
8. Test migrations against local Postgres BEFORE Neon.
9. NEVER commit `.env` with real credentials.
10. Every foreign key column MUST have an index.

## Schema (Phase 1)

### Auth & RBAC
- `users` — id, email, password_hash, role_id, is_active, created_at, updated_at, deleted_at
- `roles` — id, name, description, is_system
- `permissions` — id, code, module, action, description
- `role_permissions` — role_id, permission_id
- `user_roles` — user_id, role_id, scope_type, scope_id, valid_from, valid_to

### Profiles
- `students` — id, user_id, reg_no, section, batch, phone, cgpa, placement_status, ...
- `student_history` — student_id, data (JSONB), valid_from, valid_to, changed_by, approved_by
- `faculty` — id, user_id, designation, department, research_interests, ...
- `faculty_history` — faculty_id, data, valid_from, valid_to, changed_by, approved_by

### Files & Audit
- `documents` — id, owner_id, type, url, version, content_hash, uploaded_at
- `audit_logs` — id, actor_id, action, resource_type, resource_id, payload, created_at

## Indexing Strategy

### B-tree (single + composite)
```sql
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_reg_no ON students(reg_no) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_cgpa_dept ON students(department, cgpa DESC);
CREATE INDEX idx_students_placed ON students(placement_status) WHERE placement_status = 'placed';
```

### GIN (arrays + JSONB)
```sql
CREATE INDEX idx_students_skills ON students USING GIN (skills);
CREATE INDEX idx_students_tags ON students USING GIN (tags);
CREATE INDEX idx_history_data ON student_history USING GIN (data);
```

### HNSW (pgvector)
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_embeddings_hnsw ON embeddings
  USING hnsw (embedding vector_cosine_ops);
```

### GiST (full-text search)
```sql
ALTER TABLE students ADD COLUMN search_vector tsvector;
CREATE INDEX idx_students_search ON students USING GIST (search_vector);
```

## Versioning Pattern

Every UPDATE to student/faculty in ONE transaction:

```python
async def update_student(db: AsyncSession, student_id: int, changes: dict, actor_id: int):
    async with db.begin():
        # 1. Close current history row
        await db.execute(
            update(StudentHistory)
            .where(StudentHistory.student_id == student_id)
            .where(StudentHistory.valid_to.is_(None))
            .values(valid_to=func.now())
        )
        # 2. Insert new history row
        await db.execute(
            insert(StudentHistory).values(
                student_id=student_id,
                data=changes,
                valid_from=func.now(),
                valid_to=None,
                changed_by=actor_id,
            )
        )
        # 3. Update main table
        await db.execute(
            update(Student).where(Student.id == student_id).values(**changes)
        )
```

## Soft Delete Pattern
- Never `DELETE FROM`. Set `deleted_at = now()`.
- All queries filter `WHERE deleted_at IS NULL`.
- Partial indexes exclude soft-deleted rows.
- Provide a `restore()` method for admins.

## Migration Rules
- One migration per logical change.
- Always write `downgrade()`.
- Test against local Postgres first.
- Never edit a migration after it's applied.
- Never mix schema changes with data seeds — separate migrations.

## Connection String
```
DATABASE_URL=postgresql+asyncpg://user:pass@host/db?ssl=require
```
- Use **pooler** endpoint for serverless (Render).
- Use **direct** endpoint for migrations.
- Rotate password immediately if leaked.

## Anti-Patterns (NEVER do these)
- ❌ Raw SQL in application code — use ORM
- ❌ Missing indexes on foreign keys
- ❌ Storing files in DB — use R2
- ❌ Schema changes without Alembic
- ❌ Manual DB edits
- ❌ Editing an applied migration
- ❌ `SELECT *` in hot paths

## Testing
- Use a separate test database.
- Reset between tests.
- Use fixtures for seed data.

---
