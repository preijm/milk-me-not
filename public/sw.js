// The smallest service worker that lets Chrome offer "Install app".
//
// It caches NOTHING, on purpose. Every request goes to the network exactly as
// it would without this file, so a new deploy is never hidden behind a stale
// copy and the version.json update banner keeps working (docs/deployment.md).
//
// Chrome ignores an empty fetch handler when deciding whether to offer its
// install prompt, so page loads are passed through explicitly. Navigation
// preload starts that request while the worker is still waking up, so a page
// load is not slowed down by the worker. Everything else never touches it.
//
// Never just delete this file: see "Removing the service worker" in
// docs/deployment.md.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : null,
      self.clients.claim(),
    ]),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      Promise.resolve(event.preloadResponse).then((preloaded) => preloaded || fetch(event.request)),
    );
  }
});
