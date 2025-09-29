/* eslint-disable no-undef */
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

workbox.setConfig({ debug: false });
workbox.core.skipWaiting();
workbox.core.clientsClaim();

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.NetworkFirst({
    cacheName: "pp-pages",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }),
    ],
  }),
);

workbox.routing.registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/api/"),
  new workbox.strategies.NetworkFirst({
    cacheName: "pp-api",
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "style" || request.destination === "script",
  new workbox.strategies.StaleWhileRevalidate({ cacheName: "pp-assets" }),
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "font",
  new workbox.strategies.CacheFirst({
    cacheName: "pp-fonts",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 6,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data.type === "QUEUE_DRAFT") {
    caches.open("pp-drafts").then((cache) => {
      const blob = new Blob([JSON.stringify(event.data.payload)], { type: "application/json" });
      cache.put(`draft-${event.data.payload.id}`, new Response(blob));
    });
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-drafts") {
    event.waitUntil(
      (async () => {
        const cache = await caches.open("pp-drafts");
        const keys = await cache.keys();
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        const drafts = await Promise.all(
          keys.map(async (request) => {
            const response = await cache.match(request);
            if (!response) return null;
            const json = await response.json();
            await cache.delete(request);
            return json;
          }),
        );
        clients.forEach((client) => client.postMessage({ type: "SYNC_DRAFTS", drafts: drafts.filter(Boolean) }));
      })(),
    );
  }
});
