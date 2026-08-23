/*
 * Minimal service worker for the installable Admin app.
 *
 * Deliberately caches NOTHING: the admin dashboard shows live orders,
 * coupons and stock, so stale cached data would be worse than useless.
 * This worker exists only so the admin qualifies as an installable PWA
 * (Chrome requires a fetch handler) and to show a graceful offline notice
 * for page navigations. Everything else passes straight through to the
 * network, unchanged.
 */

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline — Shop Admin</title>
<style>
  html,body{height:100%;margin:0}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:1rem;font-family:system-ui,-apple-system,sans-serif;background:#f6f0e6;color:#201d1a;
    text-align:center;padding:2rem}
  h1{font-size:1.25rem;margin:0}
  p{color:#6e5c51;max-width:22rem;line-height:1.5;margin:0}
  button{margin-top:.5rem;border:0;border-radius:999px;background:#7e2539;color:#f6f0e6;
    padding:.7rem 1.5rem;font-size:.95rem;font-weight:600}
</style></head><body>
  <h1>You're offline</h1>
  <p>The admin dashboard needs a connection to load your latest orders and coupons. Reconnect and try again.</p>
  <button onclick="location.reload()">Retry</button>
</body></html>`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Only intervene on page navigations, and only to provide an offline
  // fallback. Never cache — always go to the network first for live data.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
      ),
    );
  }
  // All other requests: no respondWith → the browser handles them normally.
});
