const CACHE_NAME = 'flex-v1.0';
const ASSETS = [
  '/nano-flex/',
  '/nano-flex/index.html',
  '/nano-flex/manifest.json',
  '/nano-flex/icon-192.png',
  '/nano-flex/icon-512.png',
  '/nano-flex/a.svg'
];

// Installation : mise en cache + skipWaiting chaîné correctement
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(ASSETS.map(url =>
        cache.add(url).catch(err => console.log("Fichier non bloquant manquant :", url))
      ));
    }).then(() => self.skipWaiting()) // ← chaîné après la mise en cache complète
  );
});

// Activation : nettoyage des anciennes versions
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

// Stratégie : CACHE-FIRST (priorité absolue au local pour la vitesse)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(res => {
      return res || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/nano-flex/index.html');
      });
    })
  );
});
