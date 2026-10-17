/* Offline cache: pages are network-first (so edits show up), assets cache-first. */
const V = 'trips-v4';
const PAGES = ['./', 'index.html', 'xian.html', 'hiroshima.html', 'hangzhou.html', 'italy.html', 'finland.html'];
const ASSETS = ['manifest.webmanifest', 'assets/icon-180.png', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/fonts/barlow-condensed-500.woff2', 'assets/fonts/barlow-condensed-600.woff2', 'assets/fonts/barlow-condensed-700.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PAGES.concat(ASSETS))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate' || req.destination === 'document') {
    // 4 s budget for the network, then fall back to the saved copy
    e.respondWith((async () => {
      const cache = await caches.open(V);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))]);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) caches.open(V).then(c => c.put(req, res.clone()));
    return res;
  })));
});
