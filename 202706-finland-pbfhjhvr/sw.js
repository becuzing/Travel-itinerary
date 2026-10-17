/* Offline copy of this folder's page. Network first (4 s), saved copy when offline or blocked. */
const V = 'trip-v6';
const PRE = ['./', '../a2hs.js?v=6', '../icons/icon-192.png', '../icons/apple-touch-icon.png',
  '../assets/fonts/barlow-condensed-500.woff2', '../assets/fonts/barlow-condensed-600.woff2', '../assets/fonts/barlow-condensed-700.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(V);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 4000))]);
        if (res && res.ok) c.put('./', res.clone());
        return res;
      } catch (err) { return (await c.match('./')) || Response.error(); }
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) caches.open(V).then(c => c.put(req, res.clone())); return res; })));
});
