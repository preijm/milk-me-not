/**
 * Whether the deployed site has moved on from the bundle this tab is running.
 *
 * A single-page app that is already loaded never asks for `index.html` again,
 * so a tab left open keeps its bundle indefinitely — which is how a phone came
 * to be showing a scan dialog whose wording had been replaced weeks earlier.
 * Cache headers cannot help with that: `must-revalidate` is honoured on the
 * next request, and there is no next request.
 *
 * So the app asks. `version.json` is emitted beside the bundle by the build
 * that produced it, so its id and `BUILD_ID` are the same value written twice,
 * and any difference means the edge is serving something newer.
 */

declare const __BUILD_ID__: string;

/** The build this bundle came from. Vite replaces it at build time. */
export const BUILD_ID: string =
  typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "unknown";

/**
 * Read the deployed build id, or null when there is no clear answer.
 *
 * Null rather than a guess, in every failing case. The Worker serves the SPA
 * fallback for anything it cannot find, so a deploy that somehow lacks this
 * file answers with `index.html` and a 200 — parsed as JSON that fails, or as
 * JSON of the wrong shape. Treating either as "a new version" would put an
 * update banner in front of every reader on every check, forever.
 *
 * `cache: no-store` and a query string because the point is to defeat exactly
 * the caching this exists to detect.
 */
export const fetchDeployedBuildId = async (
  signal?: AbortSignal,
): Promise<string | null> => {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;

    const body: unknown = await res.json();
    const id = (body as { buildId?: unknown } | null)?.buildId;
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    // Offline, aborted, or the SPA fallback handing back HTML.
    return null;
  }
};

/**
 * Deployed is different from what is running, and both are known.
 *
 * An unknown build id on either side is not an update. A dev bundle carries
 * `dev-<timestamp>` and a production one a commit sha, so the two never
 * accidentally agree — but neither should they be compared across a `bun dev`
 * session pointed at a production `version.json`, which is why an unknown
 * running id answers false rather than true.
 */
export const isStaleBuild = (running: string, deployed: string | null): boolean =>
  Boolean(deployed) && running !== "unknown" && running !== deployed;
