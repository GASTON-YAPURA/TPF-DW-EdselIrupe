const CACHE_VERSION = 'edsellrupe-v1'

const CORE_ASSETS = [
  '/',
  '/servicios',
  '/reservar',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone()
        const esNavegacion = request.mode === 'navigate'
        const esAsset = url.pathname.startsWith('/assets/')
        if (esNavegacion || esAsset) {
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(() =>
        caches
          .match(request)
          .then(
            (match) =>
              match ||
              (request.mode === 'navigate' ? caches.match('/') : undefined)
          )
      )
  )
})