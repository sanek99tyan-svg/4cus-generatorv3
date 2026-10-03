const CACHE = '4cus-v3';
const ASSETS = [
  './index.html','./templates.html','./styles.css','./app.js','./data.js','./manifest.webmanifest',
  './assets/icon-192.png','./assets/icon-512.png','./assets/foki-main.png','./assets/foki-front.png','./assets/foki-happy.png','./assets/foki-thinking.png','./assets/foki-box.png','./assets/foki-pointing.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
