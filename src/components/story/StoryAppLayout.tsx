import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StoryHeader } from "./StoryHeader";
import { StoryFooter } from "./StoryFooter";
import { MilkDrop } from "./motifs";
import { StoryAppBar } from "./StoryAppBar";

export type StoryAppLayoutProps = {
  children: React.ReactNode;
  /** Page title, set in story display type. Omit for pages that own their head. */
  title?: string;
  /** Second headline line, set in green — the marketing pages' accent idiom. */
  accent?: string;
  /** Small green all-caps label above the headline. */
  kicker?: string;
  /** One line under the title saying what the page is for. */
  lede?: string;
  /** Constrain the body column. Settings forms want narrow; grids want wide. */
  width?: "narrow" | "wide";
  /** Renders a back link above the title, for sub-steps of a larger flow. */
  back?: { to: string; label: string };
  /**
   * The visual that sits beside the page header from `lg` up. Every marketing
   * hero pairs its text with one; the member pages went text-only, which two
   * blind critics separately identified as the biggest single reason this half
   * of the site read as a lesser pass of the same system. Defaults to the
   * milk-drop motif so no page is left without one by omission.
   */
  visual?: React.ReactNode;
  /**
   * Utility pages get a plain one-line heading and no hero visual. The
   * marketing hero pattern belongs on pages that are still selling; on a
   * settings form it is several hundred pixels of preamble in front of a
   * couple of fields.
   */
  compact?: boolean;
  className?: string;
};

const BackArrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
    <path d="M19 12H6m5.5 6.5L5 12l6.5-6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The shell the signed-in pages share.
 *
 * Same header, palette, type and grounds as the public story pages, so the
 * crossing from /results into /add does not change products — but with member
 * navigation in place of the marketing call to action, because someone on this
 * side of the sign-in has already been sold.
 */
export const StoryAppLayout = ({ children, title, accent, kicker, lede, width = "narrow", back, visual, compact = false, className }: StoryAppLayoutProps) => {
  const location = useLocation();
  // Pointing the header CTA at the page you are already on reads as a dead end.
  const onRateFlow = location.pathname.startsWith("/add");

  return (
    <div className={cn("story-surface flex min-h-dvh flex-col", className)}>
      <StoryHeader hideCta={onRateFlow} />

      <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pb-16 lg:pt-12">
        <div className={cn("mx-auto w-full", width === "narrow" ? "max-w-2xl" : "max-w-[76rem]")}>
          {back && (
            <Link
              to={back.to}
              className="mb-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-muted no-underline transition-colors hover:text-story-green-dark"
            >
              <BackArrow />
              {back.label}
            </Link>
          )}
          {title && (
            <header className={cn("flex items-center gap-10", compact ? "mb-6" : "mb-7 lg:mb-10")}>
              <div className="min-w-0 flex-1">
                {kicker && <p className="story-kicker mb-2.5 text-story-green-dark">{kicker}</p>}
                {/* Ink line plus a green accent line, as every marketing
                    headline does — these were flat black. */}
                <h1
                  className={cn(
                    "story-display text-story-ink",
                    compact
                      ? "text-[1.9rem] sm:text-[2.2rem]"
                      : "text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem]",
                  )}
                >
                  {title}
                  {accent && <span className="block text-story-green">{accent}</span>}
                </h1>
                {lede && <p className="mt-2.5 max-w-prose text-[0.9375rem] text-story-muted sm:text-[1rem]">{lede}</p>}
              </div>
              {!compact && (
                <div aria-hidden className="hidden shrink-0 lg:block">
                  {visual ?? <MilkDrop size={150} variant="solid" className="text-story-green-light" />}
                </div>
              )}
            </header>
          )}
          {children}
        </div>
      </main>

      <div className="pb-[4.75rem] lg:pb-0">
        <StoryFooter hideCta />
      </div>
      <StoryAppBar />
    </div>
  );
};

export default StoryAppLayout;
