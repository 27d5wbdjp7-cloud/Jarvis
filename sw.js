/* Jarvis Service Worker
 * Strategie:
 *  - App-Dateien (HTML/JS/CSS/Manifest): "network-first" mit 3 s Zeitlimit – online kommt die aktuelle
 *    Version, offline (oder bei lahmer Verbindung) die zuletzt gespeicherte.
 *  - Icons und Schriften: "cache-first" (ändern sich praktisch nie).
 *  - API-Aufrufe (api.anthropic.com) und alles außer GET gehen immer direkt ins Netz.
 *  - Eine neue Version wartet, bis die App "skipWaiting" schickt (Knopf "Neu laden" im Hinweis).
 */
const VERSION = "jarvis-v1.1.0";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./fonts/fonts.css",
  "./fonts/BricolageGrotesque-500-700-latin.woff2",
  "./fonts/BricolageGrotesque-500-700-latin-ext.woff2",
  "./fonts/IBMPlexSans-400-latin.woff2",
  "./fonts/IBMPlexSans-400-latin-ext.woff2",
  "./fonts/IBMPlexSans-500-latin.woff2",
  "./fonts/IBMPlexSans-500-latin-ext.woff2",
  "./fonts/IBMPlexSans-600-latin.woff2",
  "./fonts/IBMPlexSans-600-latin-ext.woff2",
  "./fonts/IBMPlexMono-400-latin.woff2",
  "./fonts/IBMPlexMono-400-latin-ext.woff2",
  "./fonts/IBMPlexMono-500-latin.woff2",
  "./fonts/IBMPlexMono-500-latin-ext.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!url.protocol.startsWith("http") || url.origin !== self.location.origin) return;
  const isStatic = /\/icons\/|\/fonts\/|apple-touch-icon\.png$/.test(url.pathname);

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (isStatic) {
      if (hit) return hit;
      try { const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }
      catch { return Response.error(); }
    }
    if (hit && !navigator.onLine) return hit;
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 3000);
    try {
      const res = await fetch(req, { signal: ctl.signal });
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      if (hit) return hit;
      if (req.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
      return Response.error();
    } finally { clearTimeout(t); }
  })());
});
