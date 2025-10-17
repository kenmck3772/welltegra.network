
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('wt-cache-v1').then(c=>c.addAll([
    '/', '/index.html','/css/styles.css','/js/main.js','/data/wells.json','/data/videos.json'
  ])));
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
