---
name: cost-optimization
description: Finds and executes cost-saving opportunities across all
  layers. Use when auditing spend or planning optimizations.
---

# Cost Optimization

## When to use
- Monthly optimization review.
- After cost spike.
- Before upgrading paid plans.

## Optimization Techniques
| Technique | Saving | Effort |
|-----------|--------|--------|
| Caching (Redis) | 30–50% API calls | Low |
| Batching DB writes | 10x faster | Low |
| Image optimization (WebP) | 70% bandwidth | Low |
| Compression (Brotli) | 5x smaller | Low |
| CDN (Cloudflare) | 80% origin bandwidth | Low |
| Deduplication (files) | 30–50% storage | Medium |
| Tiered storage | 60% storage cost | Medium |
| Read replica | Offload analytics | High |
| Query optimization | 10x faster | Medium |

## ROI Formula
```
ROI = (Annual Saving - Implementation Cost) / Implementation Cost
```

## Prioritization
1. High saving + low effort → do now.
2. High saving + high effort → plan.
3. Low saving + low effort → batch.
4. Low saving + high effort → skip.

## Anti-Patterns
- ❌ Optimizing before measuring
- ❌ Micro-optimizations
- ❌ Sacrificing reliability for cost
- ❌ No tracking of savings
