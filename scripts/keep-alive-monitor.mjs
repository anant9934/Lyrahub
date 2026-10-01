/**
 * Standalone Secondary Keep-Alive & Health Monitor
 * 
 * Periodically sends a lightweight GET /api/v1/health/warm request
 * to verify readiness, keep database connections alive, and log diagnostics.
 * 
 * Usage:
 *   node scripts/keep-alive-monitor.mjs [backendUrl] [intervalMinutes]
 * Example:
 *   node scripts/keep-alive-monitor.mjs https://lyrahub.onrender.com 10
 */

const backendUrl = process.argv[2] || process.env.BACKEND_URL || "https://lyrahub.onrender.com";
const intervalMinutes = parseInt(process.argv[3] || "10", 10);
const intervalMs = intervalMinutes * 60 * 1000;

function cleanUrl(url) {
  return url.replace(/\/+$/, "").replace(/\/api\/v1(\/health\/(live|ready|warm))?$/, "");
}

const targetUrl = `${cleanUrl(backendUrl)}/api/v1/health/warm`;

async function ping() {
  const timestamp = new Date().toISOString();
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Lyrahub-SecondaryKeepAlive/1.0" }
    });
    clearTimeout(timeout);
    const dur = Date.now() - start;
    const data = await res.json().catch(() => null);
    console.log(`[${timestamp}] ${res.status === 200 ? "OK" : "WARN"} | ${targetUrl} | Status: ${res.status} | Latency: ${dur}ms | DB: ${data?.db || "unknown"}`);
  } catch (err) {
    const dur = Date.now() - start;
    console.error(`[${timestamp}] FAIL | ${targetUrl} | Latency: ${dur}ms | Error: ${err.message}`);
  }
}

console.log(`Starting Lyrahub Secondary Monitor targeting: ${targetUrl} every ${intervalMinutes}m`);
ping();
setInterval(ping, intervalMs);
