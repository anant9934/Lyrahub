---
name: opt-server
description: Optimizes server runtime, process management, and resource
  usage — Uvicorn, Caddy, OS tuning, connection pooling. Use when
  server performance degrades or scaling.
---

# Server Optimization

## When to use
- CPU or RAM >70% sustained.
- Latency spike (p95 > 500ms).
- Scaling decision.
- Deployment tuning.

## Uvicorn / Gunicorn
```bash
# Production: Gunicorn with Uvicorn workers
gunicorn app.main:app \
  --workers $((2 * $(nproc) + 1)) \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 60 \
  --keep-alive 5 \
  --max-requests 1000 \
  --max-requests-jitter 100
```

Workers = 2 × CPU cores + 1 (rule of thumb).

## Caddy / Nginx
```
# Caddyfile
{
  servers {
    protocol {
      experimental_http3
    }
  }
}

hub.example.com {
  encode zstd gzip
  reverse_proxy backend:8000 {
    health_uri /health/ready
    health_interval 10s
  }
}
```

## OS Tuning (sysctl)
```bash
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
vm.swappiness = 10
fs.file-max = 1000000
```

## Connection Pooling (PgBouncer)
- Mode: transaction (best for async).
- Pool size: 20–50 per service.
- Max client connections: 1000.
- Reduces DB connection overhead by 90%.

## Docker Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Graceful Shutdown
```python
@app.on_event("shutdown")
async def shutdown():
    await finish_pending_requests(timeout=30)
    await close_db()
    await close_redis()
```

## Monitoring
- CPU: Prometheus node_exporter.
- Memory: node_exporter.
- Disk I/O: iostat, node_exporter.
- Network: node_exporter.
- Alerts: >70% CPU, >80% RAM, >90% disk.

## Anti-Patterns
- ❌ Single worker in production
- ❌ No connection pooling
- ❌ No OS tuning
- ❌ No resource limits
- ❌ Hard shutdown
