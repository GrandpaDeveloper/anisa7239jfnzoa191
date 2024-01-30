// Versión del caché
const CACHE_NAME = 'mdolar-cache-v1';

// Lista de archivos para cachear
const urlsToCache = [
  '/',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Hace que el nuevo Service Worker se active inmediatamente
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Elimina los cachés antiguos
          }
        })
      );
    }).then(() => {
      self.clients.claim(); // Toma control de las páginas abiertas inmediatamente
    })
  );
});


// Intercepta las peticiones de red y devuelve los recursos desde el caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el recurso desde el caché si está disponible
        if (response) {
          return response;
        }

        // Si no, recupéralo de la red y añádelo al caché
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
  );
});



importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js");

workbox.routing.registerRoute(
  ({request}) => request.destination === "image",
  new workbox.strategies.NetworkFirst()
);
