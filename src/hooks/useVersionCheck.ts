import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  APP_VERSION,
  isNewerVersion,
  isMajorUpdate,
  shouldShowVersion,
  dismissVersion,
} from "@/lib/appVersion";
import { isNativeApp } from "@/lib/platformDetection";

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
  hasUpdate: boolean;
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
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

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
        const versionInfo = data as AppVersionInfo;
        setLatestVersion(versionInfo);

        // Check if there's a newer version and if we should show it
        const hasNewVersion = isNewerVersion(APP_VERSION, versionInfo.version);
        const shouldShow = hasNewVersion && shouldShowVersion(versionInfo.version);
        setShowUpdateNotice(shouldShow);
      }
    } catch (err) {
      console.error("[VersionCheck] Error checking version:", err);
      setError(err instanceof Error ? err.message : "Failed to check version");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissUpdate = useCallback(
    (remindHours: number = 24) => {
      if (latestVersion) {
        dismissVersion(latestVersion.version, remindHours);
        setShowUpdateNotice(false);
      }
    },
    [latestVersion]
  );

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  const hasUpdate = latestVersion ? isNewerVersion(APP_VERSION, latestVersion.version) : false;
  const isMajor = latestVersion ? isMajorUpdate(APP_VERSION, latestVersion.version) || latestVersion.is_major : false;
  const requiresApkUpdate = latestVersion?.requires_apk_update ?? false;

  return {
    isLoading,
    error,
    latestVersion,
    currentVersion: APP_VERSION,
    hasUpdate,
    isMajor,
    requiresApkUpdate,
    isNative,
    showUpdateNotice,
    dismissUpdate,
    recheckVersion: checkVersion,
  };
}
