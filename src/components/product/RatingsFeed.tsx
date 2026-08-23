/**
 * The individual ratings behind the score.
 *
 * Signed-out visitors already get real rows here — score, price-to-quality,
 * how it was drunk, when — straight from `milk_tests_aggregated_view`, which
 * strips the taster's name, note and photo before it ever reaches the
 * client. So there is nothing to fake: the gate below the list is one honest
 * invitation to sign in, not a page of blurred-out placeholder cards.
 */
import { formatDistanceToNowStrict } from "date-fns";
import { humanizeLabel } from "@/lib/labels";
import { ArrowRight, ScoreMark, StoryButton, StoryCard } from "@/components/story";
import { resolvePriceQuality } from "./useProductStory";
import type { MilkTestResult } from "@/types/milk-test";

const ROW_LIMIT = 8;

/** A handful of seeded rows carry an epoch placeholder instead of a real
    timestamp — "57 years ago" reads as broken, not old, so treat anything
    before the site existed as "no date on file" rather than show it. */
const EARLIEST_PLAUSIBLE = new Date("2020-01-01").getTime();

const relativeDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() < EARLIEST_PLAUSIBLE) return null;
  try {
    return `${formatDistanceToNowStrict(date)} ago`;
  } catch {
    return null;
  }
};

const RatingRow = ({ test, isAuthed }: { test: MilkTestResult; isAuthed: boolean }) => {
  const pq = resolvePriceQuality(test.price_quality_ratio);
  const note = test.notes?.trim();
  const when = relativeDate(test.created_at);

  return (
    <li className="flex flex-col gap-2.5 border-t border-story-ink/8 py-4 first:border-t-0 sm:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8125rem] font-medium text-story-muted-2">
          {isAuthed && test.username && (
            <span className="font-bold text-story-ink">{test.username}</span>
          )}
          {test.drink_preference && <span>{humanizeLabel(test.drink_preference)}</span>}
          {pq && (
            <span className="rounded-full px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em]" style={{ backgroundColor: pq.light, color: pq.color }}>
              {pq.label}
            </span>
          )}
          {when && <span>{when}</span>}
        </div>
        <ScoreMark score={test.rating} size="sm" showTier={false} className="shrink-0" />
      </div>
      {isAuthed && note && (
        <p className="story-serif text-[0.9375rem] italic leading-snug text-story-ink-2">&ldquo;{note}&rdquo;</p>
      )}
    </li>
  );
};

/** The one honest gate: no note text exists in the payload to begin with. */
const SignInTease = ({ onGo }: { onGo: () => void }) => (
  <li className="border-t border-story-ink/8 pt-5">
    <StoryCard className="flex flex-col items-start gap-3 bg-story-ink px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-[0.9375rem] font-medium leading-snug text-white/85">
        Names and tasting notes are for members only — sign in to see who wrote what.
      </p>
      <StoryButton onClick={onGo} tone="paper" size="md" className="w-full shrink-0 sm:w-auto">
        Sign in
        <ArrowRight />
      </StoryButton>
    </StoryCard>
  </li>
);

export const RatingsFeed = ({
  ratings,
  isAuthed,
  onSignIn,
}: {
  ratings: MilkTestResult[];
  isAuthed: boolean;
  onSignIn: () => void;
}) => {
  const shown = ratings.slice(0, ROW_LIMIT);
  const remaining = ratings.length - shown.length;

  if (shown.length === 0) {
    return (
      <p className="text-[0.9375rem] text-story-muted">No individual ratings on file yet — be the first.</p>
    );
  }

  return (
    <div>
      <ol className="flex flex-col">
        {shown.map((test, i) => (
          <RatingRow key={test.id || i} test={test} isAuthed={isAuthed} />
        ))}
        {!isAuthed && <SignInTease onGo={onSignIn} />}
      </ol>
      {remaining > 0 && (
        <p className="mt-5 text-[0.8125rem] font-medium text-story-muted-2">
          + {remaining} more rating{remaining === 1 ? "" : "s"} on file.
        </p>
      )}
    </div>
  );
};

export default RatingsFeed;
