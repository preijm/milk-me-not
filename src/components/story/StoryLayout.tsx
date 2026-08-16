import { cn } from "@/lib/utils";
import { StoryHeader } from "./StoryHeader";
import { StoryFooter } from "./StoryFooter";
import { StoryButton, ArrowRight } from "./primitives";
import { useRateCta } from "./useRateCta";

/**
 * Sticky bottom action bar for narrow viewports.
 *
 * Phones get the same single call to action the desktop header carries, pinned
 * where a thumb can reach it, instead of a tab bar full of app navigation.
 */
const MobileCtaBar = ({ hint }: { hint?: string }) => {
  const cta = useRateCta();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-story-ink/[0.07] bg-story-cream/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden">
      <StoryButton onClick={cta.go} size="md" className="w-full">
        {cta.label}
        <ArrowRight />
      </StoryButton>
      {hint && <p className="mt-1.5 text-center text-[0.6875rem] font-medium text-story-muted-2">{hint}</p>}
    </div>
  );
};

export type StoryLayoutProps = {
  children: React.ReactNode;
  /** Hero bands that run to the top of the page want a transparent header. */
  transparentHeader?: boolean;
  /** Suppress the sticky mobile action bar (pages that own their own footer CTA). */
  hideMobileCta?: boolean;
  mobileCtaHint?: string;
  className?: string;
};

/**
 * The shell every public page shares: header, story surface, footer, and the
 * one call to action — identical on a phone and on a 27" monitor.
 */
export const StoryLayout = ({
  children,
  transparentHeader = false,
  hideMobileCta = false,
  mobileCtaHint,
  className,
}: StoryLayoutProps) => (
  <div className={cn("story-surface flex min-h-dvh flex-col", className)}>
    <StoryHeader transparent={transparentHeader} />
    <main className="flex-1">{children}</main>
    {/* The sticky bar is fixed, so the *last* thing on the page has to reserve
        room for it — padding `main` left the footer's own tagline sitting
        underneath the bar at the true bottom of the scroll. */}
    <div className={cn(!hideMobileCta && "pb-[5.25rem] sm:pb-0")}>
      <StoryFooter />
    </div>
    {!hideMobileCta && <MobileCtaBar hint={mobileCtaHint} />}
  </div>
);

export default StoryLayout;
