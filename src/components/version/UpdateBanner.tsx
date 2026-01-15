import { X, RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVersion } from "@/contexts/VersionContext";
import { ReleaseNotes } from "./ReleaseNotes";

export function UpdateBanner() {
  const {
    showUpdateNotice,
    latestVersion,
    currentVersion,
    isMajor,
    requiresApkUpdate,
    isNative,
    dismissUpdate,
  } = useVersion();

  // Don't show for major updates (they get a modal) or if no update
  if (!showUpdateNotice || !latestVersion || isMajor) {
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
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  Version {latestVersion.version} available
                </span>
                <span className="text-xs opacity-75">
                  (current: {currentVersion})
                </span>
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

              <div className="mt-2">
                <ReleaseNotes notes={latestVersion.release_notes} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isNative && requiresApkUpdate ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownloadApk}
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
