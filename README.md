# Lyrahub — AI & ML Department Enterprise Hub

> Production-grade department portal with RBAC, AI gateway, ranking, events, projects, alumni, and QR attendance.

**Stack:** Next.js 14 (Vercel) · FastAPI (Render) · Neon PostgreSQL · Redis · Cloudflare

---

## Table of Contents

1. [Architecture](#architecture)
2. [Local Development](#local-development)
3. [Deploy to Production](#deploy-to-production)
   - [Step 1 — Database (Neon)](#step-1--database-neon)
   - [Step 2 — Redis (Upstash)](#step-2--redis-upstash)
   - [Step 3 — Backend (Render)](#step-3--backend-render)
   - [Step 4 — Frontend (Vercel)](#step-4--frontend-vercel)
   - [Step 5 — Keep-Alive (Cloudflare Worker)](#step-5--keep-alive-cloudflare-worker)
4. [Environment Variables](#environment-variables)
5. [AI Gateway Policy](#ai-gateway-policy)
6. [Health Checks](#health-checks)

---

## Architecture

```
Browser
  │
  ├── Vercel (Next.js 14)
  │     NEXT_PUBLIC_API_URL → Render backend
  │
  └── Render (FastAPI + Uvicorn)
        ├── Neon PostgreSQL (via asyncpg)
        ├── Redis / Upstash (quota + cache)
        └── Cloud AI providers (Groq → Cerebras → Gemini → …)

Cloudflare Worker → pings Render /health/live every 14 min (free-tier keepalive)
```

---

## Local Development

### Prerequisites

- Docker Desktop
- Node.js 18+
- Python 3.11+

### 1. Clone & configure

```bash
git clone https://github.com/your-org/lyrahub.git
cd lyrahub
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, SUPERADMIN_PASSWORD
```

### 2. Start infrastructure

```bash
docker-compose up -d   # Starts Postgres + Redis
```

### 3. Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000  
API docs: http://localhost:8000/docs

---

## Deploy to Production

### Step 1 — Database (Neon)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the **Connection string** (asyncpg format):
   ```
   postgresql+asyncpg://user:pass@ep-xxx.neon.tech/neondb?ssl=require
   ```
3. Enable **pgvector** extension in the SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Run migrations locally against Neon first:
   ```bash
   cd backend
   DATABASE_URL="postgresql+asyncpg://..." alembic upgrade head
   ```

---

### Step 2 — Redis (Upstash)

1. Create a free Redis database at [upstash.com](https://upstash.com)
2. Copy the **Redis URL** (format: `redis://default:pass@host:port`)
3. Note it for Step 3

---

### Step 3 — Backend (Render)

#### Option A — Blueprint Deploy (recommended)

1. Push this repo to GitHub
2. In [Render Dashboard](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo → Render detects `render.yaml`
4. Set **secret env vars** in the dashboard (marked `sync: false` in render.yaml):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string |
   | `REDIS_URL` | Upstash Redis URL |
   | `SUPERADMIN_EMAIL` | `admin@aiml.hub` |
   | `SUPERADMIN_PASSWORD` | Strong password |
   | `GEMINI_API_KEYS` | Comma-separated keys |
   | `GROQ_API_KEYS` | Comma-separated keys |
   | `OPENROUTER_API_KEYS` | Comma-separated keys |
   | `CEREBRAS_API_KEYS` | Comma-separated keys |
   | `MISTRAL_API_KEYS` | Comma-separated keys |
   | `SAMBANOVA_API_KEYS` | Comma-separated keys |

5. Deploy. Render will: `docker build` → `alembic upgrade head` → `uvicorn`

#### Option B — Manual Web Service

1. **New** → **Web Service** → connect repo
2. **Root Directory:** `backend`
3. **Runtime:** Docker
4. **Dockerfile Path:** `./Dockerfile`
5. **Health Check Path:** `/api/v1/health/live`
6. Add env vars as in Option A

> **Free tier note:** Render free spins down after 15 min idle. Deploy the Cloudflare Worker (Step 5) to prevent this.

---

### Step 4 — Frontend (Vercel)

#### Option A — Vercel CLI

```bash
cd frontend
npx vercel --prod
```

#### Option B — GitHub Integration

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
2. **Root Directory:** `frontend`
3. **Framework Preset:** Next.js (auto-detected)
4. **Environment Variables:**

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend>.onrender.com/api/v1` |
   | `NEXT_PUBLIC_APP_URL` | `https://lyrahub.vercel.app` |

5. Deploy. Vercel builds with `npm ci && npm run build`.

#### Custom Domain

1. Vercel Dashboard → **Domains** → add your domain
2. Point DNS to Vercel's nameservers (or add CNAME)

---

### Step 5 — Keep-Alive (Cloudflare Worker)

Prevents Render free-tier from sleeping and exercises the database readiness check.

```bash
# Install Wrangler
npm install -g wrangler
wrangler login

cd infra/cloudflare-worker

# Set your backend URL as a secret:
wrangler secret put BACKEND_URL
# Enter your Render URL (e.g. https://lyrahub-backend.onrender.com)

# Then deploy:
wrangler deploy
```

The Worker runs on a cron every **4 minutes**, calling `/api/v1/health/ready`.


---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL asyncpg connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `JWT_SECRET` | ✅ | 64-char random secret for JWT signing |
| `SUPERADMIN_EMAIL` | ✅ | Super admin account email |
| `SUPERADMIN_PASSWORD` | ✅ | Super admin account password |
| `CLOUD_AI_ENABLED` | — | `true`/`false` kill switch (default: `true`) |
| `GROQ_API_KEYS` | — | Comma-separated Groq keys |
| `GEMINI_API_KEYS` | — | Comma-separated Gemini keys |
| `STUDENT_CLOUD_CALLS_PER_DAY` | — | Default: `0` |
| `HOD_CLOUD_CALLS_PER_DAY` | — | Default: `5` |

Full list: see [`.env.example`](.env.example)

---

## AI Gateway Policy

| Role | Cloud Calls/Day | Browser SLM | Local Ollama |
|---|---|---|---|
| Student | 0 (blocked) | ✓ | ✓ |
| Faculty | 1 | ✓ | ✓ |
| HOD | 5 | ✓ | ✓ |
| COS / HOS | 3 | ✓ | ✓ |
| Super Admin | 50 | ✓ | ✓ |

**Priority chain:** Deterministic SQL → DB cache → Browser SLM → Cloud LLM  
**Provider fallback:** Groq → Cerebras → Gemini → OpenRouter → Mistral → SambaNova  
**Quota resets:** daily at 00:00 IST

---

## Health Checks

| Endpoint | Description |
|---|---|
| `GET /api/v1/health/live` | Liveness — always 200 if process running |
| `GET /api/v1/health/ready` | Readiness — checks DB + Redis connectivity |
| `GET /api/v1/ai/quota` | Current user's AI quota status |
| `GET /api/v1/ai/admin/policy` | AI policy config (Admin/HOD only) |

---

## License

Internal — AI & ML Department, 2026.
