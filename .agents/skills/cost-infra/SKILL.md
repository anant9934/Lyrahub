---
name: cost-infra
description: Tracks and optimizes infrastructure costs across Vercel,
  Render, Neon, Cloudflare, Upstash. Use when auditing or forecasting
  hosting costs.
---

# Infrastructure Cost Management

## When to use
- Monthly cost review.
- Planning paid upgrades.
- Auditing free tier usage.
- Forecasting costs at scale.

## Free Tier Tracking
| Service | Limit | Alert At |
|---------|-------|----------|
| Vercel | 100 GB bandwidth | 80 GB |
| Render | 750 hrs/month | 600 hrs |
| Neon | 0.5 GB storage | 0.4 GB |
| Neon | 100 CU-hrs | 80 CU-hrs |
| R2 | 10 GB storage | 8 GB |
| Upstash | 10K cmd/day | 8K cmd |

## Upgrade Triggers
- Vercel: commercial use OR >100GB → Pro ($20)
- Render: spin-down unacceptable → Starter ($7)
- Neon: >0.5GB OR >100 CU-hrs → Launch (~$5)
- R2: >10GB → $0.015/GB

## Monthly Report Template
```
| Service | Limit | Used | % | Cost |
|---------|-------|------|---|------|
| Vercel  | 100GB | 45GB | 45% | ₹0 |
| Render  | 750hr | 720hr| 96% | ₹0 |
...
Total: ₹0
Forecast at 500 users: ₹X
```

## Anti-Patterns
- ❌ Ignoring free tier limits
- ❌ No usage alerts
- ❌ Upgrading without justification
- ❌ Not tracking bandwidth
