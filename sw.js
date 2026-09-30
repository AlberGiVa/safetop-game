// Service worker: permite jugar sin conexión e instalar el juego como app.
// Estrategia: red primero (para recibir actualizaciones), caché si no hay red.
const CACHE = 'safetop-arcade-v2';
const FILES = [
  './', './index.html', './manifest.json', './lib/phaser.min.js',
  './src/main.js', './src/utils.js', './src/art.js', './src/data/products.js', './src/data/assets.js',
  './src/scenes/BootScene.js', './src/scenes/MenuScene.js', './src/scenes/AlmacenScene.js',
  './src/scenes/ZonaSeguraScene.js', './src/scenes/AlturaScene.js', './src/scenes/InspectorScene.js',
  './src/scenes/RunnerScene.js', './src/scenes/GameOverScene.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png', './assets/safecoin.png', './assets/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
