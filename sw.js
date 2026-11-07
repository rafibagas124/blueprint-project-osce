// =========================================================================
// SERVICE WORKER - OSCE CENTER 3D
// Strategi: network-first (versi terbaru selalu diutamakan saat online),
// cache sebagai cadangan agar aplikasi tetap terbuka saat koneksi lemah.
// API & WebSocket tidak pernah di-cache.
// =========================================================================

const CACHE_NAME = "osce-center-3d-v4";
const ASSETS_TO_CACHE = [
  "./blueprint.html",
  "./manifest.json",
  "./css/style.css",
  "./vendor/three.min.js",
  "./js/i18n.js",
  "./js/stations-data.js",
  "./js/avatar.js",
  "./js/station-models.js",
  "./js/scene-environment.js",
  "./js/station-simulations.js",
  "./js/ai-patient.js",
  "./js/multiplayer.js",
  "./js/network.js",
  "./js/assessor.js",
  "./js/scoring.js",
  "./js/ui-modals.js",
  "./js/ux-minimap-tutorial.js",
  "./js/input.js",
  "./js/pwa.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS_TO_CACHE.map((u) => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/") || url.pathname === "/ws") return;

  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && (resp.ok || resp.type === "opaque")) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match("./blueprint.html")))
  );
});
