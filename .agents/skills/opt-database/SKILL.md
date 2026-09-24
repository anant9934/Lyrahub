---
name: opt-database
description: Optimizes queries, indexes, and DB configuration. Use when
  queries are slow or DB CPU is high.
---

# Database Optimization

## When to use
- Slow query (p95 > 100ms).
- High DB CPU.
- Lock contention.
- Growing dataset.

## Index Strategy

### B-tree (single + composite)
```sql
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_cgpa_dept ON students(department, cgpa DESC);
```

### Partial indexes (smaller, faster)
```sql
CREATE INDEX idx_placed ON students(id) WHERE placement_status = 'placed';
```

### GIN (arrays, JSONB)
```sql
CREATE INDEX idx_skills ON students USING GIN (skills);
CREATE INDEX idx_tags ON students USING GIN (tags);
```

### GiST (full-text)
```sql
CREATE INDEX idx_search ON students USING GIST (search_vector);
```

### HNSW (pgvector)
```sql
CREATE INDEX idx_embedding ON embeddings
  USING hnsw (embedding vector_cosine_ops);
```

## Query Optimization

### EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE SELECT * FROM students WHERE cgpa > 8;
```

### Avoid N+1
```python
# Bad
for student in students:
    print(student.department.name)

# Good
students = await db.query(Student).options(
    selectinload(Student.department)
).all()
```

### Use CTEs
```sql
WITH ranked AS (
  SELECT id, RANK() OVER (ORDER BY cgpa DESC) AS rank
  FROM students
)
SELECT * FROM ranked WHERE rank <= 100;
```

## Materialized Views
```sql
CREATE MATERIALIZED VIEW mv_rankings AS
SELECT id, RANK() OVER (ORDER BY cgpa DESC) AS rank
FROM students WHERE deleted_at IS NULL;

-- Refresh nightly
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_rankings;
```

## Connection Pooling (PgBouncer)
- Mode: transaction.
- Pool: 20–50 per service.
- Reduces connection overhead by 90%.

## Partitioning (>10M rows)
```sql
CREATE TABLE activity (
  ...
) PARTITION BY RANGE (created_at);
```

## Autovacuum Tuning
```sql
ALTER TABLE students SET (autovacuum_vacuum_scale_factor = 0.05);
```

## Anti-Patterns
- ❌ SELECT *
- ❌ Missing indexes on FK
- ❌ N+1 queries
- ❌ No EXPLAIN ANALYZE
- ❌ Analytics on primary DB
