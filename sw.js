/* The Aru App — service worker.
   Makes the app genuinely installable and offline, and instant on repeat
   loads, while still picking up new deploys within one reload.

   Strategy: stale-while-revalidate for same-origin GETs. We serve from cache
   immediately (fast / offline), then refresh the cache from the network in the
   background so the next visit has the latest. Navigations fall back to the
   cached app shell when the network is unavailable.

   MAINTENANCE: bump CACHE_VERSION whenever you want to guarantee old caches
   are dropped (e.g. alongside a big index.html change). Stale-while-revalidate
   means you don't strictly have to — updates still arrive within one reload —
   but bumping keeps storage tidy. Keep it in step with APP_VERSION. */
const CACHE_VERSION = "aru-v4.9.0";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(c){
      // best-effort precache; don't fail install if one asset 404s
      return Promise.allSettled(SHELL.map(function(u){ return c.add(u); }));
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // ignore cross-origin

  e.respondWith(
    caches.open(CACHE_VERSION).then(function(cache){
      return cache.match(req).then(function(cached){
        var network = fetch(req).then(function(res){
          if(res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function(){
          // offline: for page navigations, fall back to the app shell
          if(req.mode === "navigate") return cache.match("./index.html");
          return cached;
        });
        return cached || network;
      });
    })
  );
});
