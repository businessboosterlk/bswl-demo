/* BSWL Student offline shell. Cache-first for the app itself; there is no
   network data layer in the demo, so offline is simply complete. */
var C='bswl-student-v1';
var ASSETS=['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(function(r){return r||fetch(e.request);}));});
