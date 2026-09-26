/**
 * Cloudflare Worker — Render Keep-Alive Pinger
 *
 * Pings the Render backend every 14 minutes to prevent the free-tier
 * instance from spinning down (Render free spins down after 15 min idle).
 *
 * Deploy: wrangler deploy
 * Schedule: every 14 minutes via cron trigger
 */

const BACKEND_URL = "https://your-backend.onrender.com/api/v1/health/live";
const PING_TIMEOUT_MS = 10000;

export default {
  // HTTP handler — for manual trigger / status check
  async fetch(request, env, ctx) {
    const result = await pingBackend();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Cron handler — runs every 14 minutes
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pingBackend());
  },
};

async function pingBackend() {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const response = await fetch(BACKEND_URL, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Lyrahub-KeepAlive/1.0" },
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    return {
      ok: response.ok,
      status: response.status,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
      url: BACKEND_URL,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
      url: BACKEND_URL,
    };
  }
}
