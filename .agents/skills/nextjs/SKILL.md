---
name: nextjs-frontend
description: Builds Next.js 14 frontend with App Router, TypeScript strict,
  Tailwind CSS, shadcn/ui, and the Unidale design system. Use when creating
  pages, components, forms, layouts, or client-side data logic.
---

# Next.js Frontend Development

## When to use this skill
- Building any UI page or component for the hub.
- Creating layouts, dashboards, forms, tables, or charts.
- Implementing client-side data fetching or auth context.

## Core Rules

1. Use **App Router** (`app/` directory). NEVER Pages Router.
2. **TypeScript strict mode** — no `any` types.
3. **Tailwind CSS** for ALL styling. No CSS modules, no styled-components.
4. Use **shadcn/ui** components. Do not rebuild from scratch.
5. Data fetching uses **React Query** (TanStack Query v5).
6. Forms use **React Hook Form** + **Zod** for validation.
7. **Server Components** by default. Add `"use client"` only when needed.
8. Every page must be mobile-responsive (mobile-first).
9. Every page must support dark mode via CSS variables.
10. Follow `skills/ui-unidale/SKILL.md` for ALL visual design.

## Project Structure

frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── students/page.tsx
│   │   └── ...
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/             # shadcn primitives
│   └── features/       # domain components
├── lib/
│   ├── api.ts          # fetch wrapper
│   ├── auth.ts         # auth helpers
│   └── utils.ts        # cn() etc
├── hooks/
├── types/
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json

## Data Fetching Rules
- Server Components: use `fetch` with caching.
- Client Components: use React Query.
- Never call backend directly from client for auth-sensitive operations —
  proxy through Next.js API routes.
- Always handle loading, error, and empty states.

## Component Rules
- Functional components only.
- Props typed with `interface`.
- Named exports (except page.tsx and layout.tsx which use default).
- Co-locate styles with components (Tailwind inline).
- Extract reusable logic to hooks.

## Auth Pattern
- Store JWT in **httpOnly cookie** (set by backend).
- Refresh automatically on 401.
- Provide `<AuthProvider>` context for role/user info.
- Protect routes with middleware.

## Form Pattern

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});

async function onSubmit(values: z.infer<typeof schema>) {
  await api.post("/auth/login", values);
}
```

## Anti-Patterns (NEVER do these)
- ❌ `useEffect` for data fetching — use React Query
- ❌ Inline styles — use Tailwind
- ❌ Hardcoded API URLs — use `process.env.NEXT_PUBLIC_API_URL`
- ❌ Large client components — split server/client
- ❌ Client-side auth checks as security — always verify on backend
- ❌ Direct DOM manipulation — use React state

## Performance Rules
- Use `next/image` for all images.
- Use `next/font` for Geist.
- Code-split with `next/dynamic` for heavy components.
- Prefetch on hover with `<Link prefetch>`.
- Keep client bundle small — no lodash, moment, etc.

## Testing Hooks
- Component logic in hooks for easy testing.
- Use `vitest` + `@testing-library/react`.
- Test user behavior, not implementation.

---
