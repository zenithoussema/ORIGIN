path: #? For Node
import { writeFileSync } from 'node:fs';
import { cwd } from 'node:process';

writeFileSync('C:/ORIGIN/public/sw.js', `const CACHE_NAME = 'origin-static-v1';
const API_CACHE_NAME = 'origin-api-v1';
const FONT_CACHE_NAME = 'origin-fonts-v1';
const IMAGE_CACHE_NAME = 'origin-images-v1';
const OFFLINE_CACHE_NAME = 'origin-offline-v1';
const STATIC_ASSETS = [
  '/',
  '/menu',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_ASSETS).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) =>
        key !== CACHE_NAME &&
        key !== API_CACHE_NAME &&
        key !== FONT_CACHE_NAME &&
        key !== IMAGE_CACHE_NAME &&
        key !== OFFLINE_CACHE_NAME
      ).map((key) => caches.delete(key))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) return response.clone();
          const clone = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (url.pathname.startsWith('/fonts/') || url.pathname.match(\.woff2?$)) {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) =>
        cache.match(event.request)
          .then((cached) => cached || fetch(event.request)
            .then((response) => {
              if (!response.ok) return response;
              const clone = response.clone();
              cache.put(event.request, clone);
              return response;
            })
            .catch(() => cached)
          )
      )
    );
    return;
  }

  if (url.pathname.match(/\.(avif|webp|jpg|jpeg|png|gif|svg|ico)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) =>
        cache.match(event.request)
          .then((cached) => {
            if (cached) return cached;
            return fetch(event.request)
              .then((response) => {
                if (!response.ok) return response;
                const clone = response.clone();
                cache.put(event.request, clone);
                return response;
              })
              .catch(() => new Response('Offline', { status: 503 }))
          })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (!response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Service Unavailable', { status: 503 });
        });

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'ORIGIN';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192-maskable.png',
    data: data.url || '/',
    actions: data.actions || [
      { action: 'view', title: 'View', icon: '/icons/icon-192x192.png' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(self.clients.claim());

  if (event.notification.data?.url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes(event.notification.data.url)) {
            return client.focus();
          }
        }
        return self.clients.openWindow(event.notification.data.url);
      })
    );
  }

  event.notification.close();
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  try {
    const queuedOrders = await getQueuedOrders();
    for (const order of queuedOrders) {
      await submitOrder(order);
      await removeQueuedOrder(order.id);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function getQueuedOrders() {
  const orders = JSON.parse(localStorage.getItem('orderQueue') || '[]');
  return orders.filter((o) => o.status === 'pending' || o.status === 'retry');
}

async function submitOrder(order) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!response.ok) {
    console.error('Order submission failed:', response.status);
    order.retryCount = (order.retryCount || 0) + 1;
    order.status = 'retry';
    localStorage.setItem('orderQueue', JSON.stringify([...getQueuedOrders(), order]));
  }
}

async function removeQueuedOrder(orderId) {
  let orders = JSON.parse(localStorage.getItem('orderQueue') || '[]');
  orders = orders.filter((o) => o.id !== orderId);
  localStorage.setItem('orderQueue', JSON.stringify(orders));
}
`);

console.log('SW template created!');