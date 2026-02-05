/**
 * Service Worker: PWA installability + basic offline support.
 * - install: pre-cache app shell (HTML, manifest, icons).
 * - activate: claim clients.
 * - fetch: network first; when offline, serve from cache.
 * Minimal strategy; no advanced caching.
 */

// Уникальное имя кеша с версией (обновляется при изменении ресурсов)
const CACHE_NAME = 'dark-club-v2'

// App shell: entry and static assets to cache on install
const SHELL_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  // Только наш домен (работает на любом домене через Vercel)
  if (url.origin !== self.location.origin) return

  // Критичные ресурсы (логотип, иконки, splash) — сначала кеш, потом сеть (быстрее на iOS)
  const criticalAssets = [
    '/logo.svg',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json',
  ]
  const isCritical = criticalAssets.some(asset => url.pathname === asset || url.pathname.startsWith('/splash-'))

  if (isCritical) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Обновляем кеш в фоне
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            }
          }).catch(() => {})
          return cached
        }
        // Нет в кеше — загружаем из сети
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        }).catch((err) => {
          console.error('Failed to fetch critical asset:', event.request.url, err)
          // Возвращаем пустой ответ вместо ошибки
          return new Response('', { status: 404, statusText: 'Not Found' })
        })
      })
    )
    return
  }

  // Остальные ресурсы: сеть сначала, кеш как fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses for offline fallback
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline or network error: serve from cache
        return caches.match(event.request)
      })
  )
})
