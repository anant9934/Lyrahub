# ──────────────────────────────────────────────────────
# Lyrahub Backend — Production Dockerfile (Render Monorepo Root)
# Multi-stage build: builder → runtime
# ──────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ── Runtime image ─────────────────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    KNOWLEDGE_BASE_PATH=/knowledge

WORKDIR /app

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 libmagic1 && \
    rm -rf /var/lib/apt/lists/*

# Install wheels built in builder
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* && \
    rm -rf /wheels

# Copy backend application code
COPY backend/ /app/

# Copy knowledge directory for OKF institutional intelligence
COPY knowledge/ /knowledge/

# Create non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup /app /knowledge

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/api/v1/health/live')" || exit 1

EXPOSE ${PORT}

# Run migrations then start server
CMD alembic upgrade head && \
    uvicorn app.main:app \
        --host 0.0.0.0 \
        --port ${PORT} \
        --workers 2 \
        --loop uvloop \
        --http httptools \
        --proxy-headers \
        --forwarded-allow-ips='*'
