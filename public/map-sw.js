const TILE_CACHE_NAME = "maplibre-tiles-v1";
const ASSET_CACHE_NAME = "maplibre-assets-v1";

// Force immediate activation and control over active browser tabs
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (
    url.pathname.includes("tile") ||
    url.pathname.includes("openmaptiles") ||
    url.href.includes(".pbf")
  ) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(event.request)
            .then((networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }

              const sanitizedHeaders = new Headers(networkResponse.headers);
              sanitizedHeaders.set(
                "Cache-Control",
                "public, max-age=31536000, immutable",
              );

              const forcedCacheResponse = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: sanitizedHeaders,
              });

              cache.put(event.request, forcedCacheResponse.clone());
              return forcedCacheResponse;
            })
            .catch(() => {
              return new Response("Offline tile unavailable", { status: 503 });
            });
        });
      }),
    );
    return;
  }

  // ----------------------------------------------------------------------
  // STRATEGY 2: STALE-WHILE-REVALIDATE FOR MAP CONFIGS, STYLES, & FONTS
  // ----------------------------------------------------------------------
  if (
    url.pathname.includes("styles") || // 🟢 Changed from 'styles/' to 'styles'
    url.pathname.includes("sprites") ||
    url.pathname.includes("glyphs") || // 🟢 Added glyphs matching for fonts
    url.pathname.includes("fonts") ||
    url.href.includes(".json")
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {});

          return cachedResponse || fetchPromise;
        });
      }),
    );
    return;
  }
});
