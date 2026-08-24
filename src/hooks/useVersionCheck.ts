import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  APP_VERSION,
  isNewerVersion,
  isMajorUpdate,
  shouldShowVersion,
  dismissVersion,
} from "@/lib/appVersion";
import { isNativeApp } from "@/lib/platformDetection";
import { BUILD_ID, fetchDeployedBuildId, isStaleBuild } from "@/lib/deployedBuild";

/** A tab that simply stays open still hears about a deploy within the hour. */
const POLL_INTERVAL_MS = 30 * 60 * 1000;

/** Tab-switching should not become one request per switch. */
const FOREGROUND_THROTTLE_MS = 5 * 60 * 1000;

export interface AppVersionInfo {
  id: string;
  version: string;
  release_notes: string | null;
  is_major: boolean;
  requires_apk_update: boolean;
  min_supported_version: string | null;
  published_at: string;
}

export interface VersionCheckResult {
  isLoading: boolean;
  error: string | null;
  latestVersion: AppVersionInfo | null;
  currentVersion: string;
  /** The build this tab is running, and what the edge is serving now. */
  buildId: string;
  deployedBuildId: string | null;
  hasUpdate: boolean;
  /**
   * A newer *published* release, as opposed to merely a newer build.
   *
   * The two are different things and the banner has to say the right one. The
   * `app_versions` row is not necessarily newer than what is running — it is
   * simply the most recent row there is — so its version number is only worth
   * printing when it actually beats the running one.
   */
  publishedIsNewer: boolean;
  isMajor: boolean;
  requiresApkUpdate: boolean;
  isNative: boolean;
  showUpdateNotice: boolean;
  dismissUpdate: (remindHours?: number) => void;
  recheckVersion: () => Promise<void>;
}

export function useVersionCheck(): VersionCheckResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<AppVersionInfo | null>(null);
  const [deployedBuildId, setDeployedBuildId] = useState<string | null>(null);
  // Dismissal lives in localStorage, so a render has to be asked for when it
  // changes. Nothing reads this but the memo below.
  const [dismissals, setDismissals] = useState(0);

  const isNative = isNativeApp();

  const checkVersion = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Query the latest version from app_versions table
      const { data, error: queryError } = await supabase
        .from("app_versions")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (queryError) {
        // If table doesn't exist or no data, silently fail
        if (queryError.code === "PGRST116" || queryError.code === "42P01") {
          setIsLoading(false);
          return;
        }
        throw queryError;
      }

      if (data) {
        // Release notes, and whether a native build must be reinstalled.
        // Whether the *web* app is behind is not this table's business any
        // more — see the build poll below.
        setLatestVersion(data as AppVersionInfo);
      }
    } catch (err) {
      console.error("[VersionCheck] Error checking version:", err);
      setError(err instanceof Error ? err.message : "Failed to check version");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ask the edge what it is serving, more than once.
   *
   * Checking at mount alone was the other half of why nobody saw an update:
   * the one moment a tab is guaranteed to be current is the moment it loads.
   * A phone left on the board for a fortnight asked once, on day one.
   *
   * So it also asks when the tab comes back to the foreground — which is when
   * a reader is about to look at it, and when a stale bundle actually costs
   * them something — and on a slow timer for a tab that simply stays open. The
   * throttle keeps tab-switching from turning into a request per switch.
   *
   * On a native build this is a no-op by construction: Capacitor serves the
   * bundled `version.json`, so it always matches and native updates stay the
   * APK's business.
   */
  const lastPolled = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    const poll = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastPolled.current < FOREGROUND_THROTTLE_MS) return;
      lastPolled.current = now;

      const id = await fetchDeployedBuildId(controller.signal);
      // A failed check leaves the last known answer alone rather than
      // retracting an update the reader has already been offered.
      if (id) setDeployedBuildId(id);
    };

    // `"requestIdleCallback" in window` narrows the else branch to `never`,
    // so the capability is read off rather than tested in place.
    const scheduler = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const first = () => void poll(true);
    const idleScheduled = Boolean(scheduler.requestIdleCallback);
    const idle = idleScheduled
      ? scheduler.requestIdleCallback!(first)
      : window.setTimeout(first, 2000);

    const onForeground = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onForeground);
    window.addEventListener("focus", onForeground);
    const timer = window.setInterval(() => void poll(true), POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
      if (idleScheduled) scheduler.cancelIdleCallback?.(idle);
      else window.clearTimeout(idle);
      document.removeEventListener("visibilitychange", onForeground);
      window.removeEventListener("focus", onForeground);
    };
  }, []);

  // Defer the release-notes lookup to avoid blocking initial render.
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => checkVersion());
    } else {
      setTimeout(() => checkVersion(), 2000);
    }
  }, [checkVersion]);

  const publishedIsNewer = latestVersion
    ? isNewerVersion(APP_VERSION, latestVersion.version)
    : false;
  const buildIsStale = isStaleBuild(BUILD_ID, deployedBuildId);
  const hasUpdate = buildIsStale || publishedIsNewer;

  /**
   * What a dismissal is remembered against.
   *
   * A published version where there is one, so "remind me tomorrow" survives
   * across builds of the same release; otherwise the deployed build id, which
   * is the only name this update has. Dismissing then lasts until the next
   * deploy, which is the right lifetime for "there is a newer bundle".
   */
  const noticeKey = publishedIsNewer && latestVersion ? latestVersion.version : deployedBuildId;

  const showUpdateNotice = useMemo(
    () => Boolean(hasUpdate && noticeKey && shouldShowVersion(noticeKey)),
    // `dismissals` is the render trigger for a localStorage write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasUpdate, noticeKey, dismissals],
  );

  const dismissUpdate = useCallback(
    (remindHours: number = 24) => {
      if (!noticeKey) return;
      dismissVersion(noticeKey, remindHours);
      setDismissals((n) => n + 1);
    },
    [noticeKey],
  );

  const isMajor = latestVersion
    ? publishedIsNewer && (isMajorUpdate(APP_VERSION, latestVersion.version) || latestVersion.is_major)
    : false;
  const requiresApkUpdate = latestVersion?.requires_apk_update ?? false;

  return {
    isLoading,
    error,
    latestVersion,
    currentVersion: APP_VERSION,
    buildId: BUILD_ID,
    deployedBuildId,
    hasUpdate,
    publishedIsNewer,
    isMajor,
    requiresApkUpdate,
    isNative,
    showUpdateNotice,
    dismissUpdate,
    recheckVersion: checkVersion,
  };
}
