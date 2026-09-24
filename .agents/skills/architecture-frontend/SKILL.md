---
name: architecture-frontend
description: Designs frontend structure, routing, rendering, state, and
  performance. Use when designing pages, components, or client-side logic.
---

# Frontend Architecture

## When to use
- Designing new pages or routes.
- Choosing rendering strategy (SSR, SSG, ISR, CSR).
- Planning state management.
- Setting performance budgets.

## Rendering Strategy
| Page Type | Strategy |
|-----------|----------|
| Landing, public | SSG |
| Dashboards | SSR |
| Profile pages | ISR (60s) |
| Chatbot | CSR |
| Analytics | SSR + streaming |

## State Management
- **Server state**: React Query
- **Client state**: Zustand
- **Form state**: React Hook Form
- **URL state**: searchParams

## Routing
- App Router with route groups: (auth), (dashboard)
- Layouts per group
- Middleware for auth
- Loading + error boundaries per route

## Performance Budget
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Bundle < 200KB gzipped
- No lodash/moment

## Anti-Patterns
- ❌ useEffect for data fetching
- ❌ Props drilling >3 levels
- ❌ Large client components
- ❌ No loading/error states
- ❌ Blocking renders on slow APIs
