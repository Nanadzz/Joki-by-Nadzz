// Service Worker — shell: StaleWhileRevalidate · API publik GET: NetworkFirst · gambar: CacheFirst · API privat tidak di-cache
const V='nadzz-v4',SHELL=['/index.html','/login.html','/pricelist.html','/pesan.html','/worker.html','/cs.html','/track.html','/syarat.html','/app.html','/css/fx.css','/css/theme.css','/css/pricelist.css','/js/fx.js','/js/api.js','/js/layout.js','/js/components.js','/js/faq.js','/manifest.json','/assets/nadzzjoki.png'];
const PUBLIC_API=['/api/catalog','/api/track','/api/workers','/api/config'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
const put=async(r,n)=>{if(n.ok)(await caches.open(V)).put(r,n.clone());return n};
const swr=async r=>{const m=await caches.match(r),f=fetch(r).then(n=>put(r,n)).catch(()=>m);return m||f};
const netFirst=async r=>{try{return await put(r,await fetch(r))}catch{return(await caches.match(r))||new Response('{"error":"Offline"}',{status:503,headers:{'Content-Type':'application/json'}})}};
const cacheFirst=async r=>(await caches.match(r))||fetch(r).then(n=>put(r,n));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
 if(u.pathname.startsWith('/api/')){if(PUBLIC_API.some(p=>u.pathname.startsWith(p)))e.respondWith(netFirst(r));return}
 e.respondWith(r.destination==='image'?cacheFirst(r):swr(r))});
