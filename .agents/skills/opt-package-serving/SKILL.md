---
name: opt-package-serving
description: Serves static assets and packages efficiently via CDN,
  versioning, tree-shaking, code-splitting. Use when bandwidth or
  bundle size is high.
---

# Package Serving

## When to use
- Large JS bundle.
- High bandwidth costs.
- Slow LCP.
- Many HTTP requests.

## Static Asset Strategy

### 1. Content-Hash Versioning
```
app.abc123.js  (immutable, 1-year cache)
```

### 2. Immutable Cache Headers
```
Cache-Control: public, max-age=31536000, immutable
```

### 3. CDN (Cloudflare)
- Auto-cache static assets.
- Tiered caching.
- Workers for edge logic.

### 4. Compression
- Brotli (5x smaller than raw).
- Gzip fallback for old browsers.

## JS Bundle Optimization

### Tree Shaking
```ts
// Good: named imports
import { debounce } from 'lodash-es';

// Bad: default import
import _ from 'lodash';
```

### Code Splitting
- Route-based (automatic in Next.js).
- Component-based (`next/dynamic`).
- Vendor split.

### Bundle Analysis
```bash
npm run build
npx @next/bundle-analyzer
```

Target: <200 KB gzipped total.

### Defer Non-Critical JS
```tsx
<Script src="/analytics.js" strategy="lazyOnload" />
```

## Asset Preloading

### Preload critical
```html
<link rel="preload" href="/fonts/geist.woff2" as="font" crossorigin />
```

### Prefetch likely next
```tsx
<Link href="/dashboard" prefetch={true} />
```

### Preconnect external
```html
<link rel="preconnect" href="https://api.hub.example.com" />
```

## Image Serving
- WebP (3x smaller than JPEG).
- AVIF (5x smaller).
- Responsive srcset.
- Lazy load below-fold.
- CDN delivery.

## Anti-Patterns
- ❌ No versioning (cache busting)
- ❌ No compression
- ❌ No tree shaking
- ❌ No code splitting
- ❌ Serving unoptimized images
