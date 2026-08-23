/**
 * The score, broken back down into who said what.
 *
 * An average hides disagreement. This renders the same five named tiers the
 * rest of the site uses, sized by how many real ratings actually landed in
 * each one — so a 6.8 built from a pile of "Good" votes reads differently
 * from a 6.8 split between a crowd of "Gem"s and a crowd of "Poor"s.
 */
import type { TierBin } from "./useProductStory";

export const ScoreDistribution = ({ bins, max }: { bins: TierBin[]; max: number }) => (
  <ol className="flex flex-col gap-2.5">
    {[...bins].reverse().map(({ tier, count }) => {
      const pct = Math.max(count > 0 ? 6 : 0, Math.round((count / max) * 100));
      return (
        <li key={tier.key} className="flex items-center gap-3 sm:gap-4">
          <span className="story-serif w-19 shrink-0 text-[0.9375rem] font-bold sm:w-24 sm:text-base" style={{ color: tier.color }}>
            {tier.name}
          </span>
          <span className="h-8 min-w-0 flex-1 overflow-hidden rounded-full bg-story-ink/6 sm:h-9">
            <span
              className="block h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, backgroundColor: tier.color }}
            />
          </span>
          <span className="story-num w-6 shrink-0 text-right text-[0.9375rem] text-story-muted sm:w-8 sm:text-base">
            {count}
          </span>
        </li>
      );
    })}
  </ol>
);

export default ScoreDistribution;
