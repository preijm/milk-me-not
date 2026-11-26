import { useEffect } from "react";

/**
 * Fades out the home-screen app's launch screen (`#launch-screen` in
 * `index.html`) once there is something real to show.
 *
 * It renders nothing; mounting it is the signal. It sits inside the routes'
 * `Suspense`, so it only mounts after the first lazy page has loaded, and the
 * pale "loading" page with its lone spinner never shows. `TwoFactorGate`
 * mounts one too, because its code form replaces the pages entirely.
 *
 * In a browser tab the launch screen was never shown, so this does nothing.
 */
export function LaunchScreenDone() {
  useEffect(() => {
    const el = document.getElementById("launch-screen");
    if (!el) return;
    // Taps go straight through while it fades, and the removal is not tied to
    // this component staying mounted: a see-through overlay left behind would
    // swallow every tap on the page.
    el.style.pointerEvents = "none";
    el.style.opacity = "0";
    window.setTimeout(() => el.remove(), 300);
  }, []);
  return null;
}
