/* small offline/repeat-visit cache. build assets are content-hashed, so cache-first is safe for them;
   images and 3d models refresh in the background; pages go to the network first so an updated site is never hidden. */
const V = 'perlas-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname === '/sw.js') return;

  if (u.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.open(V).then(async (c) => {
        const hit = await c.match(r);
        if (hit) return hit;
        const res = await fetch(r);
        if (res.ok) c.put(r, res.clone());
        return res;
      }),
    );
    return;
  }
  if (/^\/(images|models|icons)\//.test(u.pathname)) {
    e.respondWith(
      caches.open(V).then(async (c) => {
        const hit = await c.match(r);
        const net = fetch(r).then((res) => {
          if (res.ok) c.put(r, res.clone());
          return res;
        });
        return hit || net;
      }),
    );
    return;
  }
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((res) => {
          if (res.ok) caches.open(V).then((c) => c.put('/', res.clone()));
          return res;
        })
        .catch(() => caches.match('/').then((m) => m || Response.error())),
    );
  }
});
