const CACHE_NAME = 'splitter-calculator-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'page2.html',
  'page3.html',
  'page4.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Install: pre-cache all app pages and assets so the app works fully offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean up old caches on update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first (offline-first), fall back to network, then cache new responses
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If both cache and network fail (e.g. offline + not yet cached), fall back to index
          return caches.match('index.html');
        });
    })
  );
});
