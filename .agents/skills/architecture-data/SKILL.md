---
name: architecture-data
description: Designs data models, storage, flows, versioning, and analytics.
  Use when designing schemas, choosing storage, or planning data pipelines.
---

# Data Architecture

## When to use
- Designing new entities or relationships.
- Choosing storage (Postgres, Redis, R2, DuckDB, pgvector).
- Planning data flows or analytics.
- Designing versioning or soft-delete patterns.

## Storage Choices
| Need | Choice |
|------|--------|
| OLTP | PostgreSQL (Neon) |
| Cache | Redis (Upstash) |
| Files | Cloudflare R2 |
| Vectors | pgvector (in Neon) |
| Analytics | DuckDB (on Parquet) |
| Search | PostgreSQL FTS or Meilisearch |

## Core Rules
1. Normalize for OLTP, denormalize for analytics.
2. Every table has id, created_at, updated_at, deleted_at.
3. Every FK has an index.
4. Every profile table has a *_history sibling.
5. Soft delete only — never hard DELETE.
6. Version every profile change.
7. Audit every write.
8. Partition tables >10M rows.
9. Read replica for analytics.
10. Materialized views for dashboards.

## Data Flow Pattern
```
Write → Primary DB → CDC → Parquet (R2) → DuckDB → Analytics
Read  → Read Replica / Materialized View / Cache
```

## Anti-Patterns
- ❌ Storing files in DB
- ❌ No versioning on profiles
- ❌ Hard deletes
- ❌ Missing indexes on FKs
- ❌ Analytics on primary DB
- ❌ No audit trail
