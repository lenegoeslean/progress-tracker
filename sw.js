/* FitPaw Service Worker
   Sorgt dafür, dass die App installierbar ist und sich beim nächsten
   Öffnen (mit Internetverbindung) automatisch selbst aktualisiert.

   Strategie: "Network-first" für alle Dateien der App – es wird immer
   versucht, die neueste Version vom Server zu laden. Nur wenn das
   fehlschlägt (z. B. kein Internet), wird die zuletzt gespeicherte
   Version aus dem Cache verwendet. So bleibt die App auch offline
   nutzbar, ist aber online immer aktuell. */

const CACHE_NAME = "lenegoeslean-cache-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Externe Ressourcen (z. B. Google Fonts) unangetastet lassen,
  // aber im Hintergrund für Offline-Nutzung mitcachen.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
  );
});
