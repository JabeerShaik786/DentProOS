// Minimal Service Worker for DentPro OS PWA installation support.
// No offline caching of patient, clinical, appointment, billing, or auth data is performed.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass through all requests directly to network
  return;
});
