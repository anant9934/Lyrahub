---
name: opt-frontend
description: Optimizes Core Web Vitals, bundle size, and UI responsiveness.
  Use when LCP, INP, or CLS regress.
---

# Frontend Performance

## When to use
- LCP > 2.5s.
- INP > 200ms.
- CLS > 0.1.
- Large bundle.
- Janky UI.

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.8s |
| TTFB | < 600ms |

## Bundle Optimization
- Code splitting per route.
- Dynamic imports for heavy components.
- Tree shaking (use `lodash-es`).
- Remove moment.js (use date-fns).
- Target: <200 KB gzipped.

## Image Optimization
- `next/image` with WebP/AVIF.
- Responsive srcset.
- Lazy load below-fold.
- Blur placeholder.

## Font Optimization
```tsx
import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });
```
- Subset fonts.
- Preload critical fonts.
- `font-display: swap`.

## Runtime Optimization
- `useMemo` for expensive computations.
- `useCallback` for stable callbacks.
- `React.memo` for pure components.
- Virtualize long lists (`react-window`).
- Debounce/throttle input.
- Web Workers for heavy work.

## Layout Stability (CLS)
- Set explicit width/height on images.
- Reserve space for ads/embeds.
- Avoid injecting content above existing.
- Use `font-display: optional` for critical.

## Anti-Patterns
- ❌ No code splitting
- ❌ Moment.js
- ❌ Unoptimized images
- ❌ Layout shift on load
- ❌ Blocking JS
