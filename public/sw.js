/* Xarita tile keshi: bir marta yuklangan tile qayta tarmoqdan olinmaydi. */
const CACHE = 'shomanay-tiles-v1';
const MAX_ENTRIES = 4000;
const HOSTS = ['server.arcgisonline.com', 'basemaps.cartocdn.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const host = new URL(req.url).hostname;
  if (!HOSTS.some((h) => host === h || host.endsWith('.' + h))) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) {
        cache.put(req, res.clone());
        if (Math.random() < 0.02) trim(cache);
      }
      return res;
    }),
  );
});
