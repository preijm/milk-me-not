type FeedSkeletonProps = {
  variant: "mobile" | "desktop";
};

/**
 * Loading state shaped like the real verdict cards, not a bare spinner —
 * and shaped like whichever layout is about to arrive, so nothing jumps.
 */
export const FeedSkeleton = ({ variant }: FeedSkeletonProps) => {
  if (variant === "mobile") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4" role="status" aria-label="Loading the feed">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="story-hairline flex animate-pulse flex-col gap-2.5 rounded-2xl bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-11 flex-shrink-0 rounded-lg bg-story-ink/[0.08]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded-full bg-story-ink/[0.08]" />
                <div className="h-2.5 w-1/4 rounded-full bg-story-ink/[0.08]" />
              </div>
              <div className="h-2.5 w-10 flex-shrink-0 rounded-full bg-story-ink/[0.08]" />
            </div>
            <div className="flex items-start gap-3">
              <div className="h-16 w-24 flex-shrink-0 rounded-xl bg-story-ink/[0.08]" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-2.5 w-full rounded-full bg-story-ink/[0.08]" />
                <div className="h-2.5 w-2/3 rounded-full bg-story-ink/[0.08]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading the feed">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="story-hairline flex animate-pulse flex-col gap-4 rounded-[1.25rem] bg-white p-5">
          <div className="flex items-end justify-between">
            <div className="h-9 w-16 rounded-lg bg-story-ink/[0.08]" />
            <div className="h-3 w-20 rounded-full bg-story-ink/[0.08]" />
          </div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-story-ink/[0.08]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-3/4 rounded-full bg-story-ink/[0.08]" />
              <div className="h-2.5 w-1/3 rounded-full bg-story-ink/[0.08]" />
            </div>
          </div>
          <div className="h-48 w-full rounded-xl bg-story-ink/[0.08]" />
          <div className="h-3 w-2/3 rounded-full bg-story-ink/[0.08]" />
        </div>
      ))}
    </div>
  );
};
