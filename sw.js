const CACHE_NAME = 'kontrakan-cache-v11';
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
  // Memaksa Service Worker baru untuk langsung mengambil alih tanpa menunggu tab ditutup
  self.skipWaiting();
});

// Event Activate: Membersihkan cache versi lama jika ada update
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Memastikan semua halaman langsung menggunakan Service Worker terbaru
  self.clients.claim();
});

// Event Fetch: STRATEGI NETWORK FIRST (Utamakan Internet)
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Coba ambil file terbaru dari internet (GitHub)
    fetch(event.request)
      .then(response => {
        // Jika internet jalan dan file didapat, simpan diam-diam ke dalam memori
        // agar bisa dipakai saat offline nanti.
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 2. Jika GAGAL (karena tidak ada sinyal internet), barulah pakai file dari memori HP
        return caches.match(event.request);
      })
  );
});
