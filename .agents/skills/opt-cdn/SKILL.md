---
name: opt-cdn
description: Serves content from the edge via Cloudflare CDN. Use when
  origin bandwidth is high or global latency matters.
---

# CDN Optimization

## When to use
- High origin bandwidth.
- Global user base.
- Slow static asset delivery.
- DDoS protection needed.

## Cloudflare Configuration

### Cache Rules
| Path | Cache | TTL |
|------|-------|-----|
| /_next/static/* | Yes | 1 year |
| /images/* | Yes | 1 year |
| /api/public/* | Yes | 5 min |
| /api/auth/* | Bypass | — |
| /dashboard/* | Bypass | — |

### Cache Levels
- **Standard**: cache everything.
- **No query string**: ignore query params.
- **Ignore query string**: cache regardless.

### Tiered Caching
- Enable "Tiered Cache" in Cloudflare.
- Reduces origin fetches by 80%.

### Workers (Edge Logic)
```js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      // Add auth check, rate limit at edge
    }
    return fetch(request);
  }
}
```

### Cache Purge
- On deploy: purge `/_next/*`.
- On content update: purge specific URLs.
- API: `POST /zones/{id}/purge_cache`.

## CDN Hit Ratio
- Target: >90%.
- Monitor: Cloudflare Analytics.
- Low hit → check cache headers, TTL, vary.

## Anti-Patterns
- ❌ No cache headers
- ❌ Caching authenticated routes
- ❌ No purge on deploy
- ❌ Ignoring query strings
