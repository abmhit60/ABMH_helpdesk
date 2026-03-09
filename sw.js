// ABMH HelpDesk — Service Worker
const CACHE = 'abmh-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'ABMH HelpDesk';
  const options = {
    body: data.message || 'You have a new notification',
    icon: '/abmh-logo-1.png',
    badge: '/abmh-logo-1.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'general',
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View Ticket' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('abmhhelpdesk') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});

// Background sync for offline support
self.addEventListener('fetch', e => {
  // Let all requests pass through normally
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
