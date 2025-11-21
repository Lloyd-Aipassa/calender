importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Custom Service Worker code for caching and offline support
const CACHE_NAME = 'calendar-app-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache belangrijke bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event - verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache strategy (network first, fallback to cache)
self.addEventListener('fetch', (event) => {
  // Skip caching voor POST/PUT/DELETE requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response voor cache (alleen GET requests)
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Als network faalt, gebruik cache
        return caches.match(event.request);
      })
  );
});
