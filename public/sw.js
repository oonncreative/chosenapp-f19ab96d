// Service Worker — Workbox precache (offline) + handlers de notificação.
// Processado por vite-plugin-pwa (injectManifest).
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache de todo o app shell (HTML, JS, CSS, imagens, fontes)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// HTML/navegação: NetworkFirst (fallback para cache offline)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'chosen-html',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Assets com hash (JS/CSS) — CacheFirst
registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    (request.destination === 'script' || request.destination === 'style'),
  new CacheFirst({
    cacheName: 'chosen-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

// Imagens (mascotes, ícones) — CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'chosen-images-v2',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 60 }),
    ],
  })
);

// Fontes do Google Fonts — StaleWhileRevalidate
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'chosen-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

// Fallback offline: se uma navegação falhar e não houver cache da rota pedida,
// serve uma página dedicada "Sem conexão" (offline.html) precacheada pelo Workbox.
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document' || request.mode === 'navigate') {
    const offline =
      (await caches.match('/offline.html')) ||
      (await caches.match(new Request('/offline.html', { cache: 'reload' })));
    if (offline) return offline;
  }
  return Response.error();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const MOOD_TO_CATEGORY = {
    mood_happy: 'Feliz',
    mood_neutral: 'Preciso de paz',
    mood_sad: 'Triste',
    mood_angry: 'Nervoso',
  };
  let targetUrl = (event.notification.data && event.notification.data.url) || '/home';
  if (event.action && MOOD_TO_CATEGORY[event.action]) {
    targetUrl = '/mensagem/' + encodeURIComponent(MOOD_TO_CATEGORY[event.action]) + '?color=%23f1f26c&id=mood';
  }
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          try { client.navigate(targetUrl); } catch (e) {}
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// Listener para mensagens do app (para agendar notificações simuladas se necessário)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Nota: Service Workers não podem usar setTimeout por longos períodos confiavelmente.
    // Para uma experiência real de PWA, usaríamos a Periodic Sync API ou Push API.
    // Aqui mostramos uma notificação imediata como teste se solicitado.
    if (event.data.immediate) {
      self.registration.showNotification('Chosen', {
        body: event.data.message || 'Uma palavra escolhida pra você.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  }
});
