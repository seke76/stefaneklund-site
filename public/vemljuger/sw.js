// Service worker for Vem ljuger? (scope /vemljuger). Makes the game work offline.
// Bump CACHE (also in app/vemljuger/_components/install.tsx) to drop old caches.
const CACHE = 'vl-v1'
const PAGE = '/vemljuger'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([PAGE, '/vemljuger/manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('vl-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return

  // The page: fresh from the network when online, the cached copy when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(PAGE, res.clone()))
          return res
        })
        .catch(() => caches.match(PAGE)),
    )
    return
  }

  // Scripts, styles, fonts and icons have hashed or fixed names: cache first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/vemljuger/')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
            return res
          }),
      ),
    )
  }
})
