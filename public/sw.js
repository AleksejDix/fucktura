// Minimal service worker — required for install prompt.
// Network-first: the app is online-first (it reads your own disk, not a server),
// so we don't aggressively cache. Just register a fetch handler so the PWA
// criteria are satisfied.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through. No caching — the app shell comes from Vite in dev/prod as-is.
  event.respondWith(fetch(event.request));
});
