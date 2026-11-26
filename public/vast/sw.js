// Vast Apps service worker: works offline after first visit.
// App files: network first (so updates land), cache as fallback.
// Question banks: cache first (large, ids are stable), refreshed in the background.
const CACHE = 'vast-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'family.js',
  'trivia/', 'trivia/index.html', 'trivia/style.css', 'trivia/app.js', 'trivia/q/index.json',
  'party/', 'party/index.html', 'party/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const put = (res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; };
  if (/\/trivia\/q\/(?!index\.json)/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then(put);
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
