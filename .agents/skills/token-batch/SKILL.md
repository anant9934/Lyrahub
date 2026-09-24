---
name: token-batch
description: Combines requests into batches to amortize overhead. Use
  when processing high-volume operations like embeddings or parsing.
---

# Batch Processing

## When to use
- Generating embeddings for many documents.
- Parsing many resumes.
- Sending many notifications.
- Bulk DB writes.
- Large exports.

## Batching Rules

| Operation | Batch Size | Why |
|-----------|-----------|-----|
| Embeddings | 100 texts | API supports up to 100 |
| Resume parsing | 10 resumes | Memory + quality |
| Notifications | 100 emails | Rate limits |
| DB writes | 1000 rows | Transaction size |
| Exports | Stream 1000 rows | Memory |

## Batch vs Real-Time

| Use Batch When | Use Real-Time When |
|----------------|-------------------|
| Non-urgent (nightly) | User is waiting |
| High volume | Low volume |
| Quality tolerant | Quality critical |
| Cost-sensitive | Latency-sensitive |

## Implementation Pattern

```python
async def batch_embed(texts: list[str], batch_size=100):
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        embeddings = await embed_batch(batch)
        results.extend(embeddings)
    return results
```

## Scheduled Batches

| Job | Frequency | Batch Size |
|-----|-----------|-----------|
| Embed new documents | Nightly | 100 |
| Parse new resumes | Nightly | 10 |
| Recalculate rankings | Nightly | All |
| Email digest | Daily 8 AM | 100 |
| Analytics aggregation | Hourly | All |
| Cleanup old files | Weekly | All |

## Anti-Patterns
- ❌ One API call per item
- ❌ Batch too large (OOM)
- ❌ No error handling per item
- ❌ No retry on partial failure
