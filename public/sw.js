// Minimal Service Worker for PWA functionality
// This service worker doesn't cache anything - it just enables the PWA install prompt

const CACHE_NAME = 'flight-tracker-v1';

// Install event - required for PWA
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

// Activate event - clean up old caches if any
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    clients.claim()
  );
});

// Fetch event - just pass through all requests (no offline functionality)
self.addEventListener('fetch', (event) => {
  // Simply return the network request
  event.respondWith(fetch(event.request));
});