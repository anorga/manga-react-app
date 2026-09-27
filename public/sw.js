/* Minimal offline-capable service worker for Read Manga.
 * - Network-first for navigations (so new Vercel deploys win immediately), falling back to cache when offline.
 * - Cache-first for hashed static assets (immutable), falling back to network.
 *
 * BUILD_ID and BUILD_ASSETS are placeholders for development. The Vite build
 * (see vite.config.ts) rewrites dist/sw.js to a build-specific ID and the
 * actual hashed shell assets, so each deploy gets its own cache and precaches
 * the JS/CSS it actually ships.
 */
const BUILD_ID = "dev"
const BUILD_ASSETS = []
const CACHE = 'read-manga-' + BUILD_ID
const PRECACHE = ['/', '/index.html', '/manifest.json', ...BUILD_ASSETS]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('read-manga-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Navigations: try the network first, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response
          const copy = response.clone()
          // A cache-write failure must not replace a successful response:
          // isolate it, still return the live response.
          return caches
            .open(CACHE)
            .then((cache) => cache.put('/index.html', copy))
            .catch(() => {
              /* offline cache is best-effort; the network response wins. */
            })
            .then(() => response)
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached || new Response('Offline', { status: 503, statusText: 'Offline' })),
        ),
    )
    return
  }

  // Static assets (hashed /assets/*, images, icons): cache-first with network refresh.
  const url = new URL(request.url)
  const isStatic = url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.ico'))
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
      }),
    )
  }
})
