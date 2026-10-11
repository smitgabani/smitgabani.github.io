/**
 * Retired service worker.
 *
 * The site used to install a cache-first service worker, which kept serving
 * returning visitors an old copy of the site after every deploy. The site no
 * longer registers one; this file stays at /sw.js so browsers that still have
 * the old worker pick it up on their next visit, clear its caches, unregister
 * it and reload the page from the network.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((client) => client.navigate(client.url));
    })()
  );
});
