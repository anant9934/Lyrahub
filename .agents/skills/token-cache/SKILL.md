---
name: token-cache
description: Maximizes cache hit rate to eliminate redundant token
  spend. Use when designing LLM calls, embeddings, or SQL generation.
---

# Cache Strategy

## When to use
- Every LLM call.
- Every embedding generation.
- Every Text-to-SQL query.
- Every repeated data fetch.

## Cache Layers

| Layer | TTL | What |
|-------|-----|------|
| Browser | 1 year | Static assets |
| CDN (Cloudflare) | 1 day | Public pages, images |
| Redis (response) | 1 hr | LLM responses |
| Redis (SQL) | 1 hr | Generated SQL |
| Redis (permission) | 15 min | User roles |
| Redis (session) | 7 days | Refresh tokens |
| Embedding cache | ∞ | Until source changes |
| Prompt cache | — | OpenAI/Anthropic 90% off |

## Cache Key Design

```
llm:response:{hash(query + user_scope)}
llm:sql:{hash(normalized_query + schema_version)}
embedding:{hash(text)}
permission:user:{user_id}
```

Include:
- Normalized query (lowercase, trimmed)
- User scope (department, section)
- Schema version (for SQL cache)
- Model name (for LLM cache)

## Cache Invalidation
- **On write**: clear user-specific caches.
- **On version bump**: clear all SQL caches.
- **On embedding change**: clear that embedding.
- **TTL**: automatic for time-sensitive data.

## Prompt Caching (OpenAI/Anthropic)
- System prompts cached → 90% discount on repeated tokens.
- Requires identical prefix.
- TTL: 5 min (OpenAI), 5 min (Anthropic).
- Worth it for high-frequency calls.

## Target Hit Ratios
| Cache | Target |
|-------|--------|
| LLM response | >60% |
| SQL generation | >80% |
| Embeddings | >95% |
| Permissions | >90% |

## Anti-Patterns
- ❌ No cache
- ❌ Cache without TTL
- ❌ Cache without invalidation
- ❌ Cache key missing user scope (leaks data)
- ❌ Cache key missing model name
