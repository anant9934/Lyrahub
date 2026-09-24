---
name: security-infra
description: Hardens infrastructure — Docker, TLS, secrets, network,
  Cloudflare, CI/CD, and deployment pipelines. Use when reviewing or
  writing infrastructure, containers, or deployment config.
---

# Infrastructure Security

## When to use this skill
- Reviewing Dockerfiles, docker-compose.yml, or Kubernetes configs.
- Auditing CI/CD pipelines for secret leakage.
- Verifying TLS, firewall, and network rules.
- Managing secrets, certificates, and access keys.
- Configuring Cloudflare, Render, Vercel, Neon.

## Docker Hardening

1. **Non-root user** in all containers.
2. **Minimal base images** — alpine, slim, distroless.
3. **Multi-stage builds** — no build tools in runtime image.
4. **No secrets in image** — use env vars or secrets mounts.
5. **Pinned base image versions** — no `:latest`.
6. **Read-only root filesystem** where possible.
7. **Resource limits** (CPU, memory) on all containers.
8. **Health checks** defined.
9. **No SSH, no shell** in production images (distroless).
10. **Image scanning** (Trivy) in CI.

```dockerfile
# Good pattern
FROM python:3.11-slim AS builder
# build steps

FROM python:3.11-slim
RUN useradd -m appuser
USER appuser
COPY --from=builder /app /app
```

## TLS / HTTPS

1. TLS 1.3 only (disable 1.0, 1.1, 1.2 if possible).
2. Strong cipher suites only.
3. HSTS with preload.
4. OCSP stapling enabled.
5. Certificate auto-renewal (Let's Encrypt via Cloudflare/Caddy).
6. No mixed content — all resources HTTPS.
7. Redirect all HTTP → HTTPS (301).

## Secrets Management

1. NEVER commit secrets to Git.
2. Use `.env` locally, Docker secrets in prod, Vault for scale.
3. Rotate secrets every 90 days (passwords), 30 days (JWT keys).
4. Different secrets per environment (dev/staging/prod).
5. Secrets never logged, never in error messages.
6. Use `git-secrets` or `gitleaks` in CI to scan.
7. Principle of least privilege for service accounts.
8. No shared credentials between services.

## Network Security

1. Database NOT exposed to internet — only internal network.
2. Redis NOT exposed to internet — only internal.
3. Local AI server behind Cloudflare Tunnel — no open ports.
4. Firewall: deny by default, allow only needed ports.
5. Cloudflare WAF: managed ruleset + custom rules.
6. DDoS protection: Cloudflare proxy enabled.
7. Rate limiting at edge (Cloudflare) + app layer.
8. No SSH from public internet — use Cloudflare Tunnel or bastion.
9. VPN or Zero Trust for admin access.
10. Segmented networks: web, app, data tiers.

## Cloudflare Configuration

1. **SSL/TLS**: Full (Strict) mode.
2. **Always Use HTTPS**: ON.
3. **HSTS**: Enabled with preload.
4. **Min TLS Version**: 1.3.
5. **Automatic HTTPS Rewrites**: ON.
6. **WAF**: Managed ruleset enabled.
7. **Bot Fight Mode**: ON.
8. **Rate Limiting**: Login, signup, password reset.
9. **Turnstile**: On public forms.
10. **Access**: Cloudflare Access for admin routes.

## CI/CD Security

1. Secrets stored in GitHub Secrets (encrypted).
2. Never echo secrets in logs.
3. Pin action versions (`actions/checkout@v4`, not `@main`).
4. Least-privilege tokens for actions.
5. Sign commits (GPG) for production branches.
6. Branch protection: require PR review, require CI pass.
7. No direct push to main.
8. Dependency scanning (Dependabot, Snyk).
9. SAST scanning (Semgrep, CodeQL).
10. Container scanning (Trivy).

## Backup Security

1. Backups encrypted at rest (AES-256).
2. Backups encrypted in transit (TLS).
3. Offsite backups in different region.
4. Backup access restricted to admins.
5. Restore tested monthly.
6. Retention: 30 days rolling, 1 year monthly.
7. Backups not accessible from production network.
8. Immutable backups (no deletion without approval).

## Monitoring & Alerting

1. Prometheus + Grafana for metrics.
2. Loki for logs.
3. Alertmanager for critical alerts.
4. Uptime Kuma for external monitoring.
5. Sentry/GlitchTip for error tracking.
6. Alerts on: auth failures spike, 5xx spike, resource exhaustion,
   unusual DB queries, failed logins, admin actions.
7. On-call rotation documented.

## Anti-Patterns (NEVER)

- ❌ Running containers as root
- ❌ Secrets in Git or Docker images
- ❌ Public database or Redis
- ❌ TLS < 1.2
- ❌ Wildcard CORS
- ❌ No rate limiting
- ❌ Unencrypted backups
- ❌ No monitoring
- ❌ `:latest` tags
- ❌ Hardcoded IPs (use env vars)

## Audit Output Format

For each finding:
```
[SEVERITY] Category — Title
Resource: Dockerfile / docker-compose.yml / Cloudflare config
Issue: Description
Impact: What can go wrong
Repro: How to verify
Fix: Recommended remediation
```
