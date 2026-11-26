import { Download, Share, X } from "lucide-react";
import { StoryButton } from "@/components/story";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Offers a phone visitor to put Milk Me Not on their home screen.
 *
 * Built the same way as `UpdateBanner`, and for the same reasons: it sits in
 * normal page flow above the header (a fixed strip would fight the phone's
 * fixed tab bar at the bottom, or the sticky header at the top), and it uses
 * `story-green-dark`, the green that can actually carry white text.
 *
 * Which phones see it, and when it stays away, is decided in
 * `src/lib/installPrompt.ts`.
 */
export function InstallBanner() {
  const { mode, install, dismiss } = useInstallPrompt();

  if (!mode) return null;

  return (
    <div className="bg-story-green-dark text-white" role="region" aria-label="Install the app">
      <div className="mx-auto flex w-full max-w-304 items-center gap-3 px-5 py-3 sm:gap-4 sm:px-8 lg:px-10">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[0.9375rem] font-bold leading-snug">
            Get Milk Me Not on your home screen
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-white/85">
            {mode === "android" ? (
              "Opens full-screen, like any other app."
            ) : (
              <>
                {/* Safari's Share glyph, so the button is recognisable. */}
                <Share className="mr-1 inline h-3.5 w-3.5 -translate-y-px" aria-hidden="true" />
                <span>Tap Share, then Add to Home Screen.</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {mode === "android" && (
            <StoryButton tone="paper" size="sm" onClick={install} className="gap-1.5 px-3.5 sm:px-5">
              <Download className="h-4 w-4" aria-hidden="true" />
              Install
            </StoryButton>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Don't show again"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
