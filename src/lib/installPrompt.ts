/**
 * Whether to offer a phone visitor to install milkmenot.com as an app, and how.
 *
 * Two very different mechanisms hide behind one banner:
 *
 * - **Android (Chrome and friends)** fires `beforeinstallprompt` once the site
 *   meets its install criteria (manifest + a service worker with a real fetch
 *   handler — see `public/sw.js`). The event itself is the proof that an
 *   install is possible, so the banner waits for it rather than guessing from
 *   the user agent.
 * - **iPhone and iPad Safari** has no install API at all. All we can do is tell
 *   people where Safari keeps it: Share, then Add to Home Screen. Chrome and
 *   Firefox on iOS word their share sheets differently, so the hint is shown to
 *   Safari only rather than pointing at a button that is not there.
 *
 * Kept as pure functions so the whole decision is unit-testable without a
 * browser; `useInstallPrompt` gathers the inputs.
 */

export type InstallMode = "android" | "ios" | null;

export interface InstallEnv {
  userAgent: string;
  maxTouchPoints: number;
  /** Already running as an installed app. */
  standalone: boolean;
  /** Inside the Capacitor shell. */
  native: boolean;
  /** The update banner is up; one strip at a time. */
  updateShowing: boolean;
  dismissed: boolean;
  /** Chrome has handed over its deferred `beforeinstallprompt` event. */
  hasDeferredPrompt: boolean;
}

/** Permanent: one "no" is enough. */
export const DISMISS_KEY = "mmn-install-dismissed";

export function isIosSafari(userAgent: string, maxTouchPoints: number): boolean {
  const iPhoneOrIPad = /iPhone|iPad|iPod/.test(userAgent);
  // iPadOS Safari requests the desktop site and says "Macintosh"; a real Mac
  // has no touch screen.
  const iPadAsMac = /Macintosh/.test(userAgent) && maxTouchPoints > 1;
  if (!iPhoneOrIPad && !iPadAsMac) return false;
  // Every iOS browser is WebKit and says "Safari"; the others add their own token.
  return /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(userAgent);
}

export function installMode(env: InstallEnv): InstallMode {
  if (env.standalone || env.native || env.updateShowing || env.dismissed) return null;
  if (isIosSafari(env.userAgent, env.maxTouchPoints)) return "ios";
  // Desktop Chrome fires the event too; this is a phone feature.
  if (env.hasDeferredPrompt && /Android/i.test(env.userAgent)) return "android";
  return null;
}

export function isDismissed(storage: Storage = localStorage): boolean {
  try {
    return storage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private mode can refuse storage outright. Showing the banner again is
    // a far smaller harm than crashing the page over it.
    return false;
  }
}

export function rememberDismissal(storage: Storage = localStorage): void {
  try {
    storage.setItem(DISMISS_KEY, "1");
  } catch {
    // Nothing to do: the banner still hides for this page view.
  }
}
