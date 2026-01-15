import { RefreshCw, Download, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVersion } from "@/contexts/VersionContext";
import { ReleaseNotes } from "./ReleaseNotes";

export function UpdateModal() {
  const {
    showUpdateNotice,
    latestVersion,
    currentVersion,
    isMajor,
    requiresApkUpdate,
    isNative,
    dismissUpdate,
  } = useVersion();

  // Only show modal for major updates
  if (!showUpdateNotice || !latestVersion || !isMajor) {
    return null;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDownloadApk = () => {
    window.location.href = "/install-guide";
  };

  const handleRemindLater = () => {
    dismissUpdate(24); // Remind in 24 hours
  };

  const handleDismiss = () => {
    dismissUpdate(168); // Remind in 1 week for major updates
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Major Update Available!</DialogTitle>
          <DialogDescription className="text-base">
            Version {latestVersion.version} is here
            <span className="text-muted-foreground text-sm block mt-1">
              You're currently on version {currentVersion}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {latestVersion.release_notes && (
            <div className="rounded-lg bg-muted/50 p-4 border border-border">
              <h4 className="font-medium text-sm mb-2">What's New</h4>
              <ReleaseNotes notes={latestVersion.release_notes} expanded />
            </div>
          )}

          {isNative && requiresApkUpdate && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> This update requires downloading a new APK.
                Your data will be preserved.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleRemindLater} className="sm:order-1">
            Remind me later
          </Button>

          {isNative && requiresApkUpdate ? (
            <Button onClick={handleDownloadApk} className="gap-2 sm:order-2">
              <Download className="h-4 w-4" />
              Download APK
            </Button>
          ) : (
            <Button onClick={handleRefresh} className="gap-2 sm:order-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Now
            </Button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
