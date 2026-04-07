const CACHE_NAME = 'kontrakan-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Event Install: Menyimpan file-file penting ke memori cache HP
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Membuka cache PWA');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Event Fetch: Menyediakan file dari cache jika tidak ada internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, gunakan itu. Jika tidak, ambil dari internet.
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Event Activate: Membersihkan cache versi lama jika ada update
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
