// Minimal Service Worker for PWA functionality
// This service worker doesn't cache anything - it just enables the PWA install prompt

const CACHE_NAME = 'flight-tracker-v3-force-refresh';

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

// Fetch event - handle requests with proper error handling
self.addEventListener('fetch', (event) => {
  // Skip service worker for API requests to avoid interference
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('flight-tracker-alb') ||
      event.request.url.includes('choppertracker.com')) {
    console.log('[Service Worker] Bypassing API request:', event.request.url);
    return; // Let the browser handle API requests directly
  }
  
  // Handle other requests with proper error handling
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.error('[Service Worker] Fetch failed:', error);
      // Don't try to serve from cache for now, just fail gracefully
      throw error;
    })
  );
});