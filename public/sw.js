// ORIGIN Service Worker - Production Ready
// Version: 2.0.0

const CACHE_VERSION = 'origin-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;
const FONTS_CACHE = `${CACHE_VERSION}-fonts`;

const MAX_DYNAMIC_CACHE = 100;
const MAX_API_CACHE = 50;
const MAX_IMAGES_CACHE = 200;

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/menu',
  '/about',
  '/contact',
  '/reservations',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Static assets to cache on first use
const STATIC_ASSETS_PATTERNS = [
  /\/_next\/static\//,
  /\/_next\/image\//,
  /\.(?:js|css)$/,
  /\.(?:woff|woff2|ttf|eot)$/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|gif|webp|avif|svg)$/,
  /images\.unsplash\.com/,
  /res\.cloudinary\.com/,
];

// API patterns that can be cached
const API_CACHEABLE = [
  /\/api\/recommendations/,
  /\/api\/health/,
];

// API patterns that should never be cached
const API_NO_CACHE = [
  /\/api\/auth\//,
  /\/api\/checkout/,
  /\/api\/payment/,
  /\/api\/wallet/,
  /\/api\/webhooks\//,
];

// ========== INSTALL ==========
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Failed to precache some assets:', err);
          // Cache what we can
          return Promise.allSettled(
            PRECACHE_ASSETS.map((url) =>
              cache.add(url).catch(() => console.warn(`[SW] Failed to precache: ${url}`))
            )
          );
        });
      }),
      caches.open(FONTS_CACHE),
      caches.open(IMAGES_CACHE),
      caches.open(API_CACHE),
      caches.open(DYNAMIC_CACHE),
    ]).then(() => self.skipWaiting())
  );
});

// ========== ACTIVATE ==========
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old version caches
            if (!name.startsWith(CACHE_VERSION)) return true;
            return false;
          })
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ========== FETCH ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith('http')) return;

  // Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPI(request, url));
    return;
  }

  // Next.js static assets
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Fonts
  if (/\.(?:woff|woff2|ttf|eot)$/.test(url.pathname)) {
    event.respondWith(handleFonts(request));
    return;
  }

  // Images
  if (IMAGE_PATTERNS.some((p) => p.test(url.pathname) || p.test(url.href))) {
    event.respondWith(handleImages(request));
    return;
  }

  // Static assets (JS, CSS)
  if (STATIC_ASSETS_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Everything else - stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ========== HANDLERS ==========

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Try the offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) return offlineResponse;

    // Last resort - offline HTML
    return new Response(
      `<!DOCTYPE html><html><head><title>Offline - ORIGIN</title><style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1C0A00;color:#F5ECD7;margin:0}.c{text-align:center;padding:2rem}.h{font-size:2rem;margin:1rem 0}.b{background:#C8882A;color:#1C0A00;padding:.75rem 1.5rem;border-radius:.75rem;border:none;font-weight:600;cursor:pointer;margin-top:1rem}</style></head><body><div class="c"><div style="font-size:4rem">📡</div><h1 class="h">You're Offline</h1><p>Check your internet connection and try again.</p><button class="b" onclick="location.reload()">Try Again</button></div></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

async function handleAPI(request, url) {
  // Never cache these
  if (API_NO_CACHE.some((p) => p.test(url.pathname))) {
    return fetch(request);
  }

  // Cacheable API responses
  if (API_CACHEABLE.some((p) => p.test(url.pathname))) {
    return staleWhileRevalidate(request, API_CACHE, 5 * 60 * 1000); // 5 min TTL
  }

  // Other API - network first with short cache
  return networkFirstWithCache(request, API_CACHE, 60 * 1000); // 1 min TTL
}

async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function handleFonts(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(FONTS_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function handleImages(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      const keys = await cache.keys();
      if (keys.length >= MAX_IMAGES_CACHE) {
        await cache.delete(keys[0]);
      }
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#2E1A10" width="200" height="200"/><text fill="#C8882A" font-family="system-ui" font-size="48" text-anchor="middle" x="100" y="110">☕</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// ========== CACHING STRATEGIES ==========

async function staleWhileRevalidate(request, cacheName, ttl = 10 * 60 * 1000) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  // Return cached immediately if available and not expired
  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get('sw-cache-date');
    if (dateHeader) {
      const cachedAge = Date.now() - parseInt(dateHeader, 10);
      if (cachedAge < ttl) {
        return cachedResponse;
      }
    }
    // Cache exists but might be stale - return it but update in background
    fetchPromise.catch(() => {});
    return cachedResponse;
  }

  return fetchPromise;
}

async function networkFirstWithCache(request, cacheName, ttl = 60 * 1000) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseWithDate = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      responseWithDate.headers.set('sw-cache-date', Date.now().toString());
      cache.put(request, responseWithDate);
    }
    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ========== BACKGROUND SYNC ==========

self.addEventListener('sync', (event) => {
  if (event.tag === 'origin-sync') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_PENDING_ACTIONS' });
    });
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}

// ========== PUSH NOTIFICATIONS ==========

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'ORIGIN',
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.svg',
    badge: payload.badge || '/icons/icon-72x72.svg',
    tag: payload.tag || 'origin-notification',
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'ORIGIN', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if already open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

// ========== MESSAGE HANDLING ==========

self.addEventListener('message', (event) => {
  const { data } = event;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then((info) => {
      event.ports[0]?.postMessage(info);
    });
  }

  if (data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      Promise.all(names.map((name) => caches.delete(name))).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
    });
  }
});

async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    info[name] = keys.length;
  }
  return info;
}
