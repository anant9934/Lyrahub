---
name: opt-network
description: Reduces latency and bytes on the wire via HTTP/2, HTTP/3,
  connection pooling, and round-trip reduction. Use when TTFB is high.
---

# Network Optimization

## When to use
- High TTFB.
- Many round trips.
- Slow mobile.
- Global users.

## Protocols

| Protocol | Latency | Multiplexing |
|----------|---------|--------------|
| HTTP/1.1 | High | No |
| HTTP/2 | Medium | Yes |
| HTTP/3 (QUIC) | Low | Yes + 0-RTT |

## TLS 1.3
- Faster handshake (1-RTT vs 2-RTT).
- 0-RTT for resumed sessions.
- Enable on Caddy/Nginx.

## Connection Pooling
- HTTP keepalive.
- DB pooling (PgBouncer).
- Redis pooling.

## Round Trip Reduction
- Batch API requests.
- Coalesce GraphQL queries.
- Cache responses.
- CDN edge.

## DNS Optimization
- Cloudflare DNS (fast, anycast).
- Low TTL for failover.
- DNS prefetch.

```html
<link rel="dns-prefetch" href="https://api.example.com" />
<link rel="preconnect" href="https://api.example.com" />
```

## HTTP/3 Setup (Caddy)
```
{
  servers {
    protocol {
      experimental_http3
    }
  }
}
```

## Anti-Patterns
- ❌ HTTP/1.1 only
- ❌ No keepalive
- ❌ Many small requests
- ❌ No preconnect
