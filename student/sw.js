/* BSWL Student service worker.

   THE BUG THIS FIXES: v1 was cache-first for everything with a fixed cache
   name, so index.html was served from cache forever. Any student who had
   opened the app once would never receive an update, no matter what we
   deployed. A redesign shipped to nobody.

   Strategy now:
     HTML and navigations : network first, cache as the offline fallback,
                            so a deploy always reaches the student.
     Static assets        : cache first, refreshed quietly in the background,
                            so icons and the manifest stay instant.
   Bump CACHE whenever the asset list changes. */
var CACHE='bswl-student-v5';
var ASSETS=['./','index.html','manifest.json','mark.png',
 'icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
/* mark.png is precached because it is on the LOGIN screen: the first thing a
   student sees offline should not be a gap where the logo goes. */

self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);})
  .then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){
  return Promise.all(ks.filter(function(k){return k!==CACHE;})
   .map(function(k){return caches.delete(k);}));
 }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
 var req=e.request;
 if(req.method!=='GET')return;

 var isHTML = req.mode==='navigate'
   || (req.headers.get('accept')||'').indexOf('text/html')>=0;

 if(isHTML){
  e.respondWith(
   fetch(req).then(function(res){
    var copy=res.clone();
    caches.open(CACHE).then(function(c){c.put(req,copy);});
    return res;
   }).catch(function(){
    return caches.match(req,{ignoreSearch:true})
      .then(function(r){return r||caches.match('index.html');});
   })
  );
  return;
 }

 e.respondWith(
  caches.match(req,{ignoreSearch:true}).then(function(hit){
   var net=fetch(req).then(function(res){
    if(res&&res.status===200){
     var c2=res.clone();
     caches.open(CACHE).then(function(c){c.put(req,c2);});
    }
    return res;
   }).catch(function(){return hit;});
   return hit||net;
  })
 );
});
