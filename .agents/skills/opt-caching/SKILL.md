---
name: opt-caching
description: Maximizes cache hit rate across browser, CDN, Redis, and
  app layers. Use when repeated work is detected.
---

# Caching

## When to use
- Repeated queries.
- Low cache hit ratio.
- Slow endpoints.
- High DB load.

## Multi-Layer Cache

```
Browser (1 year static, 5 min API)
    ↓
CDN (Cloudflare, 1 day static, 5 min API)
    ↓
Redis (1 hr data, 15 min permissions)
    ↓
App memory (0.1 ms)
    ↓
Database (50 ms)
```

## Cache Strategies

| Strategy | When to Use |
|----------|-------------|
| Cache-aside | General purpose |
| Write-through | Data must be fresh |
| Write-behind | High write volume |
| Read-through | Transparent caching |
| Refresh-ahead | Predictable access |

## Cache Key Design

```
response:{endpoint}:{hash(params)}:{user_scope}
llm:{hash(query + scope + model)}
sql:{hash(normalized_query + schema_version)}
embedding:{hash(text)}
permission:user:{user_id}
```

Always include:
- Normalized params
- User scope (for data isolation)
- Version (for invalidation)

## TTL Rules

| Data | TTL |
|------|-----|
| Static assets | 1 year |
| Public pages | 1 day |
| API responses (public) | 5 min |
| User data | 1 min |
| Permissions | 15 min |
| LLM responses | 1 hr |
| SQL | 1 hr |
| Embeddings | ∞ (until source changes) |
| Sessions | 7 days |

## Invalidation
- **On write**: clear user-specific keys.
- **On deploy**: purge CDN.
- **On version bump**: clear SQL caches.
- **TTL**: for time-sensitive data.

## Cache Hit Targets
| Layer | Target |
|-------|--------|
| Browser | >90% |
| CDN | >90% |
| Redis | >80% |
| LLM | >60% |
| SQL | >80% |
| Embeddings | >95% |

## Anti-Patterns
- ❌ No cache
- ❌ Cache without TTL
- ❌ Cache without invalidation
- ❌ Cache key missing user scope
- ❌ Caching authenticated responses publicly
