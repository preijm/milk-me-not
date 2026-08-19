import { RefreshCw, Download } from "lucide-react";
import { ArrowRight, StoryButton, StoryDialog, StoryDialogActions, StoryDialogClose } from "@/components/story";
import { useVersion } from "@/contexts/VersionContext";
import { ReleaseNotes } from "./ReleaseNotes";

/**
 * The major-version notice.
 *
 * It interrupts whatever the reader was doing, so it owes them a reason rather
 * than a sparkle icon and an exclamation mark. The version numbers moved out of
 * the headline and into a quiet line under the notes, where someone who cares
 * can find them and everyone else can ignore them.
 */
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

  const needsApk = isNative && requiresApkUpdate;

  return (
    <StoryDialog
      open
      // The only way out is one of the two buttons, so a stray click outside
      // must not count as "remind me later" — it silences this for a week.
      onOpenChange={() => {}}
      kicker="New version"
      title="There's a fresher one of these."
      lede={
        needsApk
          ? "This one ships as a new APK. Installing it keeps everything you have already rated."
          : "A refresh is all it takes. Nothing you have rated is affected."
      }
      size="md"
      closeButton={false}
    >
      {/* The × is not "later" — it stands the notice down for a week. */}
      <StoryDialogClose onClick={() => dismissUpdate(168)} />

      {latestVersion.release_notes && (
        <div className="rounded-[1.125rem] bg-story-cream-2 p-5">
          <p className="story-kicker text-story-green-dark">What changed</p>
          <div className="mt-3 text-[0.9375rem] leading-relaxed text-story-ink-2">
            <ReleaseNotes notes={latestVersion.release_notes} expanded />
          </div>
        </div>
      )}

      <p className="mt-4 text-[0.8125rem] text-story-muted-2">
        You are on {currentVersion} — this is {latestVersion.version}.
      </p>

      <StoryDialogActions className="mt-6">
        <StoryButton tone="outline" size="md" onClick={() => dismissUpdate(24)}>
          Not now
        </StoryButton>
        {needsApk ? (
          <StoryButton size="md" onClick={() => (window.location.href = "/install-guide")}>
            <Download className="h-4 w-4" />
            Get the new APK
          </StoryButton>
        ) : (
          <StoryButton size="md" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh now
            <ArrowRight />
          </StoryButton>
        )}
      </StoryDialogActions>
    </StoryDialog>
  );
}
