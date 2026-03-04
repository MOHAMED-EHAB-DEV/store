// Stub service worker — this app does not use a service worker.
// This file exists only to prevent 404 errors from stale browser registrations.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", async () => {
  await self.registration.unregister();
});
