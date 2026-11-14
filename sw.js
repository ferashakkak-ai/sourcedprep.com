// Sourced Prep offline support for the citizenship practice (installable web app).
// Network first, cache as fallback, for the practice pages and their question files only. Stores no user data.
var CACHE = "sp-citizenship-2026-11-14";
var CORE = ["/citizenship/", "/citizenship/2008/", "/citizenship/practice/", "/citizenship/practice.js",
            "/citizenship/questions.json", "/citizenship/questions-2008.json", "/citizenship/es128.json", "/citizenship/es2008.json",
            "/es/ciudadania/", "/es/ciudadania/2008/"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (!(u.pathname.indexOf("/citizenship/") === 0 || u.pathname.indexOf("/es/ciudadania/") === 0)) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }   // never cache an error page
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
