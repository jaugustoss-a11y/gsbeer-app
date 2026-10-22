const CACHE_NAME = 'gsbeer-shell-v1';
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Never intercept the Google Apps Script app or any cross-origin request.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;
  // Network-first for the app shell. This wrapper is not intended to run the comanda offline.
  if (request.mode === 'navigate' || SHELL_FILES.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) {
    event.respondWith(fetch(request).catch(() => caches.match(request).then(response => response || caches.match('./index.html'))));
  }
});
