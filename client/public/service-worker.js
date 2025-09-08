
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notifica';
  const options = {
    body: data.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
