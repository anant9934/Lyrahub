# /cost-audit — Full Cost Audit

1. Invoke @cost.
2. Invoke @cost-infra, @cost-ai, @cost-dev, @cost-ops, @cost-optimization.
3. Collect usage from Vercel, Render, Neon, Cloudflare, Upstash.
4. Compare against free tier limits.
5. Generate `COST_REPORT.md` with:
   - Current spend
   - Free tier usage %
   - Forecast at 100/500/1000/5000 users
   - Optimization recommendations
6. Escalate if any service >80% of limit.
