---
name: architecture-api
description: Designs REST APIs — conventions, versioning, pagination,
  errors, auth, rate limits, and webhooks. Use when designing or
  reviewing APIs.
---

# API Architecture

## When to use
- Designing new endpoints.
- Reviewing API consistency.
- Planning versioning or breaking changes.
- Designing webhooks or integrations.

## Core Conventions
- **Nouns for resources**: /students, /faculty, /events
- **Verbs via HTTP**: GET, POST, PUT, PATCH, DELETE
- **Plural names**: /students not /student
- **Nested for ownership**: /students/{id}/projects
- **Version in path**: /api/v1/...
- **Status codes**: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500
- **Errors**: RFC 7807 Problem Details
- **Pagination**: cursor-based for large lists
- **Filtering**: query params (?cgpa_min=8&placed=true)
- **Sorting**: ?sort=cgpa:desc

## Auth
- JWT access (15 min) + refresh (7 days).
- Bearer token in Authorization header.
- Rate limit per user + per IP.

## Webhooks
- Signed payloads (HMAC-SHA256).
- Idempotency-Key header.
- Retries with exponential backoff.
- Dead letter queue for failures.

## Anti-Patterns
- ❌ Verbs in URLs (/getStudents)
- ❌ Inconsistent naming
- ❌ Returning arrays at top level (wrap in object)
- ❌ Breaking changes without versioning
- ❌ No pagination on list endpoints
