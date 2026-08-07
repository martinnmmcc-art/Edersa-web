// Service worker mínimo para EDERSA Red MT.
// Objetivo: que la app (el "shell") abra sin conexión. Los datos en sí
// se manejan aparte con IndexedDB (ver lib/db/offlineQueue.ts) porque
// son datos operativos, no assets estáticos.

const CACHE_NAME = "edersa-shell-v1";
const SHELL_URLS = ["/mapa", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Nunca cachear llamadas a Supabase ni al tile server del mapa: siempre
  // red (o falla, y ahí la app misma decide qué hacer offline).
  if (
    request.url.includes("supabase.co") ||
    request.url.includes("openfreemap.org")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
