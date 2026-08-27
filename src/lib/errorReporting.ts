/**
 * Find out when the app breaks in somebody else's browser.
 *
 * Everything else that watches this project checks the code before it lands, or
 * the site after it deploys. Neither can see a component throwing on a phone in
 * a supermarket. The nearest miss was a render crash that took the whole page
 * blank — every check green, nothing served wrong, and the app simply did not
 * appear.
 *
 * Inert until `VITE_SENTRY_DSN` is set, exactly like the Mapbox key: no DSN,
 * no network calls, no cost, and the boundary still catches the crash and shows
 * the reader something either way.
 *
 * Even with a DSN the SDK is not downloaded until the first error, which keeps
 * 468KB off the critical path of a site whose whole point is loading fast in a
 * supermarket. The trade is that the first report starts with a download, so a
 * reader who closes the tab immediately may not be counted. Worth it: the
 * alternative charges every visitor for something most of them never trigger.
 * `vendor-sentry` in vite.config.ts is what keeps that chunk separate, and it
 * has to sit above the react rule — `@sentry/react` contains "react".
 */

import { BUILD_ID } from "./deployedBuild";

type Extra = Record<string, unknown>;

/** Resolved once, so a missing DSN costs one truthiness check per report. */
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export const isErrorReportingConfigured = (): boolean => Boolean(dsn);

/**
 * The loaded client, or null while it is loading or unconfigured.
 *
 * Held rather than re-imported because an error that repeats — a render loop,
 * a failing interval — would otherwise start a fresh import for every throw.
 */
let client: typeof import("@sentry/react") | null = null;
let loading: Promise<typeof import("@sentry/react") | null> | null = null;

const load = async () => {
  if (!dsn) return null;
  if (client) return client;
  if (!loading) {
    loading = import("@sentry/react")
      .then((sentry) => {
        sentry.init({
          dsn,
          // The commit this bundle came from, so a report points at a diff.
          // Same value the update banner compares against.
          release: BUILD_ID,
          environment: import.meta.env.MODE,
          // Errors only. Performance tracing on a site this size is a lot of
          // requests to answer a question nobody is asking.
          tracesSampleRate: 0,
          // Nothing here needs a reader's typing or their session replayed.
          sendDefaultPii: false,
        });
        client = sentry;
        return sentry;
      })
      .catch(() => {
        // A blocked or failed SDK must never become a second error on top of
        // the first one. Reporting is a nicety; the app is not.
        return null;
      });
  }
  return loading;
};

/**
 * Report something that went wrong, and never make it worse.
 *
 * Every failure path here returns quietly. An error reporter that throws while
 * reporting an error is how one broken component becomes a broken page.
 */
export const reportError = async (error: unknown, extra?: Extra): Promise<void> => {
  // Still worth having in the console for whoever is standing in front of it.
  console.error("[caught]", error, extra ?? "");

  try {
    const sentry = await load();
    if (!sentry) return;
    sentry.captureException(error, extra ? { extra } : undefined);
  } catch {
    // Deliberately silent.
  }
};

/**
 * Catch what React cannot.
 *
 * An error boundary only sees errors thrown while rendering. A rejected promise
 * in an event handler, a throw inside a `setTimeout`, a failed dynamic import —
 * none of those reach it, and those are most of what actually goes wrong once a
 * page is running.
 */
export const startErrorReporting = (): (() => void) => {
  const onError = (event: ErrorEvent) => {
    void reportError(event.error ?? event.message, { kind: "uncaught" });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    void reportError(event.reason, { kind: "unhandled-rejection" });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
};
