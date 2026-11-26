/**
 * Registers `public/sw.js`, which exists only so phones can install the site
 * (see that file: it caches nothing). Production builds only — a worker on the
 * dev server just gets in the way — and never inside the Capacitor shell, which
 * is already an app.
 */
export function registerServiceWorker(isNative: boolean): void {
  if (!import.meta.env.PROD || isNative || !("serviceWorker" in navigator)) return;
  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not being installable is not worth an error report.
    });
  // After load, so the worker never competes with the first paint.
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
