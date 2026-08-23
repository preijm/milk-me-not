import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { StoryHeader } from "./StoryHeader";
import { StoryFooter } from "./StoryFooter";
import { StoryAppBar } from "./StoryAppBar";
import { StoryButton, ArrowRight } from "./primitives";
import { useRateCta } from "./useRateCta";

/**
 * Sticky bottom action bar for narrow viewports — signed-out readers only.
 *
 * Shown below `lg`, which is exactly where the header trades its inline nav for
 * a burger. Someone signed in gets StoryAppBar in this slot instead, on every
 * page, so the bar never changes shape underneath them.
 */
const MobileCtaBar = ({ hint }: { hint?: string }) => {
  const cta = useRateCta();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-story-ink/[0.07] bg-story-cream/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
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
}: StoryLayoutProps) => {
  const { user } = useAuth();

  /**
   * Signed in, the members' bar is the navigation on every page — public ones
   * included.
   *
   * It used to live only on the five pages built from StoryAppLayout, which
   * meant the bar's own Board tab pointed at /results, a StoryLayout page that
   * then swapped the bar out for a single button: tapping a tab destroyed the
   * bar you tapped it in. /feed and /product/:id lost it the same way. Keying
   * the bar off the reader rather than off which shell a page happens to use
   * is what makes it hold still.
   */
  const memberBar = !!user;
  const showCtaBar = !memberBar && !hideMobileCta;

  return (
    <div className={cn("story-surface flex min-h-dvh flex-col", className)}>
      <StoryHeader transparent={transparentHeader} />
      <main className="flex-1">{children}</main>
      {/* The sticky bar is fixed, so the *last* thing on the page has to reserve
          room for it — padding `main` left the footer's own tagline sitting
          underneath the bar at the true bottom of the scroll. */}
      <div className={cn(memberBar ? "pb-19 lg:pb-0" : showCtaBar && "pb-21 lg:pb-0")}>
        <StoryFooter variant={memberBar ? "member" : "full"} />
      </div>
      {memberBar ? <StoryAppBar /> : showCtaBar && <MobileCtaBar hint={mobileCtaHint} />}
    </div>
  );
};

export default StoryLayout;
