import { MilkTestResult } from "@/types/milk-test";
import { StoryButton } from "@/components/story";
import { FeedGrid } from "./FeedGrid";
import { FeedMobileStream } from "./FeedMobileStream";
import { FeedEmptyState } from "./FeedEmptyState";
import { FeedSkeleton } from "./FeedSkeleton";
import { usePagedCount } from "@/hooks/usePagedCount";

interface FeedContentProps {
  items: MilkTestResult[];
  isLoading: boolean;
  isAuthenticated: boolean;
  variant: "mobile" | "desktop";
}

/** Verdicts revealed per batch — a long feed arrives a screenful at a time. */
const PAGE_SIZE = 9;

/**
 * The card stream only. The sell to a signed-out visitor lives in
 * `FeedHero`'s lede, not a second CTA band bolted on here — stacking that
 * band against the footer's own close and the sticky mobile bar was three
 * asks fighting for one screen.
 */
export const FeedContent = ({ items, isLoading, isAuthenticated, variant }: FeedContentProps) => {
  const [visibleCount, setVisibleCount] = usePagedCount(PAGE_SIZE, [items.length]);

  if (isLoading) {
    return <FeedSkeleton variant={variant} />;
  }

  if (items.length === 0) {
    return <FeedEmptyState isAuthenticated={isAuthenticated} />;
  }

  const visibleItems = items.slice(0, visibleCount);
  const remaining = items.length - visibleItems.length;

  return (
    <>
      {variant === "mobile" ? <FeedMobileStream items={visibleItems} /> : <FeedGrid items={visibleItems} />}

      {remaining > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <StoryButton tone="outline" size="md" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show {Math.min(remaining, PAGE_SIZE)} more
          </StoryButton>
          <p className="text-[0.8125rem] font-medium text-story-muted-2">
            {visibleItems.length} of {items.length} shown
          </p>
        </div>
      )}
    </>
  );
};
