/** Loading state for the ranked list — shaped like the real rows, not a spinner. */
export const ResultsSkeleton = () => (
  <div className="flex flex-col gap-3" role="status" aria-label="Loading results">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="story-hairline flex animate-pulse items-center gap-4 rounded-[1.25rem] bg-white p-4">
        <div className="h-5 w-6 flex-shrink-0 rounded bg-story-ink/[0.08]" />
        <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-story-ink/[0.08]" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 rounded-full bg-story-ink/[0.08]" />
          <div className="h-3.5 w-40 rounded-full bg-story-ink/[0.08]" />
        </div>
        <div className="h-7 w-14 flex-shrink-0 rounded-lg bg-story-ink/[0.08]" />
      </div>
    ))}
  </div>
);
