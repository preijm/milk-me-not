import { X, RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVersion } from "@/contexts/VersionContext";
import { ReleaseNotes } from "./ReleaseNotes";

export function UpdateBanner() {
  const {
    showUpdateNotice,
    latestVersion,
    currentVersion,
    publishedIsNewer,
    isMajor,
    requiresApkUpdate,
    isNative,
    dismissUpdate,
  } = useVersion();

  // Major updates get a modal instead.
  //
  // `latestVersion` is deliberately not required. It comes from the
  // `app_versions` table, which carries release notes and the native APK rule
  // — not the answer to "is this tab behind". Requiring it meant that a
  // freshly deployed bundle, correctly detected, still rendered nothing at all
  // unless someone had remembered to add a row.
  if (!showUpdateNotice || isMajor) {
    return null;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDownloadApk = () => {
    // Navigate to install guide for APK download
    window.location.href = "/install-guide";
  };

  const handleDismiss = () => {
    dismissUpdate(24); // Remind in 24 hours
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* A version number only where one was actually published
                    and actually beats what is running. Printing the newest row
                    in the table regardless read "Version 1.0.0 available
                    (current: 1.0.0)" on a plain redeploy. */}
                <span className="font-medium text-sm">
                  {publishedIsNewer && latestVersion
                    ? `Version ${latestVersion.version} available`
                    : "A new version is available"}
                </span>
                {publishedIsNewer && latestVersion && (
                  <span className="text-xs opacity-75">
                    (current: {currentVersion})
                  </span>
                )}
              </div>

              {isNative && requiresApkUpdate ? (
                <p className="text-xs opacity-90 mt-1">
                  A new APK is available with important updates.
                </p>
              ) : (
                <p className="text-xs opacity-90 mt-1">
                  Refresh to get the latest features and improvements.
                </p>
              )}

              {publishedIsNewer && latestVersion?.release_notes && (
                <div className="mt-2">
                  <ReleaseNotes notes={latestVersion.release_notes} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNative && requiresApkUpdate ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownloadApk}
                aria-label="Download the new app"
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRefresh}
                aria-label="Refresh to the new version"
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              aria-label="Dismiss until tomorrow"
              className="h-8 w-8 hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
