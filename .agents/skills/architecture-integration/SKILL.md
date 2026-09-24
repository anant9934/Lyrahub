---
name: architecture-integration
description: Designs integration with satellites and external systems via
  SSO, webhooks, events. Use when connecting to external services.
---

# Integration Architecture

## When to use
- Connecting to satellite websites.
- Designing SSO flows.
- Planning event-driven sync.
- Integrating third-party services.

## Integration Patterns
| Pattern | Use When |
|---------|----------|
| REST API | Sync request/response |
| SSO (OIDC) | Shared auth |
| Webhooks | Push notifications |
| Event bus | Reliable async sync |
| Batch sync | Non-critical data |
| Outbox pattern | Guaranteed delivery |

## SSO Flow (Hub as IdP)
```
User → Satellite → Redirect to Hub → Login → Token → Redirect back
```

## Event Bus
- Redis Streams (start) → RabbitMQ (scale).
- Events: student.created, interview.completed, placement.updated.
- Dead letter queue for failures.
- Replay capability.

## Sync Strategy
- Real-time for critical (ranking, placement).
- Batch nightly for non-critical (alumni updates).
- Idempotent webhooks (Idempotency-Key).
- Signed payloads (HMAC).

## Fallback
- Satellite down → queue events, retry.
- Hub down → satellite serves cached data.
- Always log sync failures.

## Anti-Patterns
- ❌ No idempotency
- ❌ No retries
- ❌ No DLQ
- ❌ No signed webhooks
- ❌ Tight coupling (direct DB access)
