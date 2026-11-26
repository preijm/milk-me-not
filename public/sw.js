// The smallest service worker that lets Chrome offer "Install app".
//
// It caches NOTHING, on purpose. Every request goes to the network exactly as
// it would without this file, so a new deploy is never hidden behind a stale
// copy and the version.json update banner keeps working (docs/deployment.md).
//
// Chrome ignores an empty fetch handler when deciding whether a site can be
// installed, so page loads are passed through explicitly. Everything else is
// left alone and never touches this worker.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
  }
});
