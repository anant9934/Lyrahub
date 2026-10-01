/**
 * Cloudflare Worker — Render Keep-Alive Pinger
 *
 * Pings the Render backend /api/v1/health/ready every 4 minutes to prevent the free-tier
 * instance from spinning down (Render free spins down after 15 min idle) and keeps
 * the database connection pool warm.
 *
 * Deploy: npx wrangler deploy
 * Schedule: every 4 minutes via cron trigger
 */

const PING_TIMEOUT_MS = 10000;

function resolveHealthUrl(rawBackendUrl, customPath) {
  if (!rawBackendUrl || typeof rawBackendUrl !== "string") {
    return null;
  }
  let base = rawBackendUrl.trim();
  // Strip trailing slashes
  base = base.replace(/\/+$/, "");
  // Strip existing health paths if provided in env var
  base = base.replace(/\/api\/v1\/health\/(live|ready|warm)$/, "");
  base = base.replace(/\/api\/v1$/, "");
  const path = customPath || "/api/v1/health/ready";
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

export default {
  // HTTP handler — for manual trigger / status check
  async fetch(request, env, ctx) {
    const result = await pingBackend(env);
    return new Response(JSON.stringify(result, null, 2), {
      status: result.ok ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    });
  },

  // Cron handler — runs on schedule
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pingBackend(env));
  },
};

async function pingBackend(env) {
  const backendUrl = env?.BACKEND_URL;
  const targetPath = env?.TARGET_PATH || "/api/v1/health/ready";
  const targetUrl = resolveHealthUrl(backendUrl, targetPath);


  if (!targetUrl) {
    return {
      ok: false,
      error: "BACKEND_URL environment variable is missing or invalid. Set it via 'wrangler secret put BACKEND_URL' or in wrangler.toml [vars].",
      timestamp: new Date().toISOString(),
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Lyrahub-KeepAlive/2.0",
        "Accept": "application/json",
      },
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    let data = null;
    try {
      data = await response.json();
    } catch {
      // response might not be JSON
    }

    return {
      ok: response.ok,
      status: response.status,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
      endpoint: "/api/v1/health/ready",
      data,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.name === "AbortError" ? "Request timed out after 10000ms" : err.message,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
      endpoint: "/api/v1/health/ready",
    };
  }
}

