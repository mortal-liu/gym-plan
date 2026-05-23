const CACHE = "gym-plan-v1";
const ASSETS = [
  "/gym-plan/",
  "/gym-plan/index.html",
  "/gym-plan/favicon.svg",
  "/gym-plan/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
