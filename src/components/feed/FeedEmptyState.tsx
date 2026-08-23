import { MilkDrop } from "@/components/story";

interface FeedEmptyStateProps {
  isAuthenticated: boolean;
}

/** A designed empty state instead of a bare "no results" string, in either voice. */
export const FeedEmptyState = ({ isAuthenticated }: FeedEmptyStateProps) => {
  if (isAuthenticated) {
    return (
      <div className="story-hairline flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center">
        <span className="text-story-green-light" aria-hidden>
          <MilkDrop size={64} variant="solid" />
        </span>
        <p className="story-serif text-[1.35rem] font-bold text-story-ink">Nobody has poured yet.</p>
        <p className="max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
          Be the first to share your tasting — the whole feed starts with one honest verdict.
        </p>
      </div>
    );
  }

  return (
    <div className="story-hairline flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center">
      <span className="text-story-green-light" aria-hidden>
        <MilkDrop size={64} variant="solid" />
      </span>
      <p className="story-serif text-[1.35rem] font-bold text-story-ink">
        The community is buzzing — you're just early to this page.
      </p>
      <p className="max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
        Members are sharing real tastings, photos and honest scores most days. Nothing has landed in the last
        stretch, but it will.
      </p>
      <p className="max-w-sm text-[0.9375rem] font-semibold text-story-ink">
        Sign in now to see what everyone's rating, and add your own.
      </p>
    </div>
  );
};
