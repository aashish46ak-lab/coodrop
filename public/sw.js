/* CODrop minimal service worker - offline shell cache */
const CACHE = "codrop-v1";
const ASSETS = ["/", "/manifest.webmanifest", "/favicon.svg", "/og.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Network-first for app routes; cache fallback for static
  if (url.pathname.startsWith("/api") || url.pathname.includes(".")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (res.ok && url.pathname.match(/\.(js|css|svg|png|webmanifest)$/)) {
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req)),
    );
  }
});
