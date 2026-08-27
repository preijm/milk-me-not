import { X, RefreshCw, Download } from "lucide-react";
import { StoryButton } from "@/components/story";
import { useVersion } from "@/contexts/VersionContext";
import { ReleaseNotes } from "./ReleaseNotes";

/**
 * The minor-version notice — the strip a reader with an open tab actually sees.
 *
 * It was the last big surface still on the pre-redesign tokens: `bg-primary`,
 * `text-primary-foreground`, a `container mx-auto` that does not line up with
 * the `max-w-304` grid every other row uses, and shadcn `Button`s carrying
 * Material-ish names like `bg-surface-container-lowest`. The green happened to
 * land right — `--primary` and `--story-green` are the same 151 100% 37.45% — so
 * it looked fine and was held together by a coincidence.
 *
 * Two things that were not fine:
 *
 * - **The dismiss × was invisible.** `variant="ghost"` resolves to
 *   `text-primary`, which is story green, painted on a story green bar. It was
 *   there, it was clickable, and nobody could see it.
 *
 *   Painting it white was not enough, which is worth writing down: nothing is
 *   legible on `--story-green`. At 151 100% 37.45% the bar has a relative
 *   luminance of 0.382, so *pure white* on it is 2.43:1 — under the 4.5:1 AA
 *   needs for body text and under the 3:1 a control needs to be discernible at
 *   all. White at 70% was 1.86:1. The bar is `--story-green-dark` now, where
 *   the headline runs 6.2:1, the sub-line 5.0:1, the kicker and the × 4.6:1. Same hue
 *   family, same brand, one that can actually carry the words on it.
 * - **It sat on top of the site header.** Fixed at `top-0 z-50` against a
 *   header that is sticky at `top-0 z-50`, with nothing offsetting the page, so
 *   the wordmark and the banner headline were printed over each other in the
 *   same 36px band. It is in normal flow now: the page starts below it and the
 *   header sticks to the top once it has scrolled away. No magic height to
 *   keep in sync, and no overlap at any width.
 *
 * The voice follows UpdateModal, which is the same notice one severity up and
 * was rewritten already. Both open on "there's a fresher one of these" and both
 * say plainly that nothing you have rated is at risk — the actual worry when
 * something appears mid-session asking you to reload.
 */
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

  const needsApk = isNative && requiresApkUpdate;
  const named = publishedIsNewer && latestVersion;

  return (
    <div className="bg-story-green-dark text-white">
      <div className="mx-auto flex w-full max-w-304 items-start gap-3 px-5 py-3.5 sm:gap-4 sm:px-8 lg:px-10">
        <div className="min-w-0 flex-1">
          {/* The version number rides in the kicker rather than the headline.
              The row it comes from is simply the most recent one there is, so
              printing it regardless read "Version 1.0.0 available (current:
              1.0.0)" on a plain redeploy — a number is only worth showing when
              a published release genuinely beats what is running. */}
          <p className="story-kicker text-white/80">
            {named ? `Version ${latestVersion.version}` : "New version"}
          </p>

          <p className="mt-1 font-sans text-[0.9375rem] font-bold leading-snug">
            There&rsquo;s a fresher one of these.
          </p>

          <p className="mt-0.5 text-[0.8125rem] leading-snug text-white/85">
            {needsApk
              ? "This one ships as a new APK. Installing it keeps everything you have already rated."
              : "A refresh is all it takes. Nothing you have rated is affected."}
            {named && <span className="text-white/70"> You are on {currentVersion}.</span>}
          </p>

          {named && latestVersion.release_notes && (
            <div className="mt-2">
              <ReleaseNotes notes={latestVersion.release_notes} tone="light" />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <StoryButton
            tone="paper"
            size="sm"
            onClick={() => (needsApk ? (window.location.href = "/install-guide") : window.location.reload())}
            aria-label={needsApk ? "Download the new app" : "Refresh to the new version"}
            className="gap-1.5 px-3.5 sm:px-5"
          >
            {needsApk ? <Download className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            <span className="hidden sm:inline">{needsApk ? "Download" : "Refresh"}</span>
          </StoryButton>

          {/* White on green, not `ghost`. See the note above: the shadcn ghost
              variant painted this the same colour as the bar behind it. */}
          <button
            type="button"
            onClick={() => dismissUpdate(24)}
            aria-label="Dismiss until tomorrow"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
