const CACHE_NAME = "kec-ladies-v2";
const STATIC_CACHE = "kec-ladies-static-v2";
const IMAGE_CACHE = "kec-ladies-images-v2";
const API_CACHE = "kec-ladies-api-v2";

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key !== STATIC_CACHE &&
              key !== IMAGE_CACHE &&
              key !== API_CACHE &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

function isImageRequest(request) {
  return request.destination === "image";
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/internal/");
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match("/offline");
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      return caches.match("/offline");
    }
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached ?? fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirst(event.request, STATIC_CACHE));
    return;
  }

  if (isImageRequest(event.request)) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  if (
    url.origin === self.location.origin &&
    (event.request.destination === "style" ||
      event.request.destination === "script" ||
      event.request.destination === "font")
  ) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});
