---
name: opt-observability
description: Measures performance, detects regressions, and generates
  reports. Use for continuous performance visibility.
---

# Performance Observability

## When to use
- Continuous monitoring.
- Weekly reporting.
- Regression detection.
- Performance reviews.

## Metrics to Track

### Backend
- p50, p95, p99 latency per endpoint.
- Requests per second.
- Error rate (4xx, 5xx).
- DB query time (p95).
- Cache hit ratio.
- Connection pool usage.

### Frontend
- LCP, INP, CLS (RUM).
- Bundle size over time.
- Time to Interactive.
- First Contentful Paint.

### Database
- Query latency (p95).
- Slow queries (>100ms).
- Connection count.
- Lock waits.
- Cache hit ratio.

### AI
- Inference latency (p95).
- Tokens per query.
- Cache hit ratio.
- Queue depth.

### Infrastructure
- CPU, RAM, disk I/O.
- Network bytes in/out.
- Container restarts.

## Alert Thresholds

| Metric | Alert |
|--------|-------|
| Endpoint p95 | >500ms |
| Error rate | >1% |
| DB p95 | >100ms |
| Cache hit | <80% |
| LCP | >2.5s |
| INP | >200ms |
| CPU | >70% |
| RAM | >80% |

## Report Template

```markdown
# Performance Report — Week of YYYY-MM-DD

## Backend
| Endpoint | p50 | p95 | p99 | RPS |
|----------|-----|-----|-----|-----|
| GET /students | 45ms | 120ms | 250ms | 200 |

## Frontend
- LCP: 1.8s ✅
- INP: 120ms ✅
- CLS: 0.05 ✅

## Regressions
- ⚠️ GET /ranking p95 up 15%

## Recommendations
1. ...
```

## Tools
- Prometheus + Grafana.
- Loki (logs).
- Jaeger/Tempo (traces).
- Sentry (errors).
- Uptime Kuma (external).
- RUM (Core Web Vitals).

## Anti-Patterns
- ❌ No metrics
- ❌ No alerts
- ❌ No regression detection
- ❌ No RUM
