---
name: cost-dev
description: Tracks development cost — hours, tooling, and technical
  debt. Use when estimating effort or reviewing dev tooling costs.
---

# Development Cost Management

## When to use
- Estimating phase effort.
- Reviewing tool subscriptions.
- Tracking technical debt cost.

## Cost Categories
| Category | Cost |
|----------|------|
| Student dev hours | ₹0–500/hr (if paid) |
| Antigravity tokens | ₹0 (if free tier) |
| Figma | ₹0 (free tier) |
| Postman | ₹0 (free tier) |
| GitHub Actions | ₹0 (2K min/month) |
| Domain | ₹800/year |

## Estimation Rules
- 1 user story = 4–8 hours (avg).
- 1 API endpoint = 2–4 hours.
- 1 page = 4–8 hours.
- Testing = 30% of dev time.
- Buffer = 20% of estimate.

## Technical Debt
- Track in `TECH_DEBT.md`.
- Estimate cost to fix.
- Prioritize by impact × ease.
- Allocate 20% of each cycle to debt.

## Anti-Patterns
- ❌ Underestimating effort
- ❌ Ignoring technical debt
- ❌ Paying for unused tools
