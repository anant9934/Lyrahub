---
name: token-monitoring
description: Tracks token usage across all consumers, alerts on
  anomalies, and generates reports. Use for continuous token visibility.
---

# Token Monitoring

## When to use
- Continuous tracking.
- Weekly reporting.
- Alerting on anomalies.
- Budget reviews.

## Metrics to Track

### Antigravity Agents
- Tokens per agent per cycle
- Tokens per skill load
- Context window usage
- Cache hit ratio (if available)

### Hub AI
- Tokens per query (input + output)
- Tokens per user per day
- Tokens per feature (chatbot, RAG, SQL)
- Cache hit ratio
- Cost per query (₹0 for local)

## Report Template

```markdown
# Token Report — Week of YYYY-MM-DD

## Antigravity Usage
| Agent | Tokens | Cycles | Avg/Cycle |
|-------|--------|--------|-----------|
| @pm | 12,000 | 3 | 4,000 |
| @engineer | 45,000 | 5 | 9,000 |
...

## Hub AI Usage
| Feature | Queries | Tokens | Cache Hit |
|---------|---------|--------|-----------|
| Chatbot | 1,200 | 480,000 | 65% |
| RAG | 800 | 320,000 | 72% |
| SQL gen | 600 | 180,000 | 80% |

## Alerts
- ⚠️ Chatbot context >4K on 12 queries
- ✅ All within budget

## Recommendations
1. ...
```

## Alert Thresholds
| Metric | Alert At |
|--------|----------|
| Daily tokens (hub) | >500K |
| Daily tokens (Antigravity) | >100K |
| Context per call | >4000 |
| Cache hit ratio | <60% |
| Cost per query | >₹0.01 |

## Anomaly Detection
- Sudden spike >50% vs 7-day average.
- Unusual query patterns.
- Repeated failed calls.

## Anti-Patterns
- ❌ No tracking
- ❌ No alerts
- ❌ No reports
- ❌ Ignoring anomalies
