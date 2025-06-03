// Service Worker Version
const SW_VERSION = '1.0.0';

self.addEventListener('install', event => {
  console.log('Service Worker installing, version:', SW_VERSION);
  self.skipWaiting(); // Ensure new service worker activates immediately
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated, version:', SW_VERSION);
  // Ensure SW takes control of all clients immediately
  event.waitUntil(clients.claim());
});

self.addEventListener('push', event => {
  try {
    let data = { title: 'New Notification', body: 'Default message' };
    
    try {
      data = event.data.json();
    } catch (e) {
      console.warn('Push event data was not JSON:', e);
      // Try text if JSON fails
      const text = event.data.text();
      data = { title: 'New Notification', body: text };
    }

    const options = {
      body: data.body,
      icon: data.icon || 'https://kokthum.com/images/kokthum.png',
      badge: data.badge || 'https://kokthum.com/images/badge.png',
      data: data.data || {},
      vibrate: data.vibrate || [100, 50, 100],
      requireInteraction: data.requireInteraction || true,
      timestamp: data.timestamp || Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  const url = data?.url || 'https://kokthum.com';

  // Focus on existing tab if open, otherwise open new tab
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_PENDING_CLICKS') {
    // Implementation for checking pending clicks if needed
    console.log('Checking for pending notification clicks');
  }
});

