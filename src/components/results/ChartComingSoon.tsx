import { SCORE_TIERS, StoryLinkButton, ArrowRight } from "@/components/story";

/**
 * Placeholder for the charts view.
 *
 * It still has to look like this site, so rather than a grey icon and an
 * apology it shows the scale the charts will eventually plot against.
 */
export const ChartComingSoon = () => (
  <div className="story-hairline relative overflow-hidden rounded-[1.5rem] bg-white px-6 py-16 sm:px-10 sm:py-20">
    <div className="mx-auto max-w-xl text-center">
      <p className="story-kicker justify-center text-story-green-dark">Not built yet</p>
      <h2 className="story-display mt-4 text-[clamp(1.8rem,4.5vw,2.6rem)] text-story-ink">
        Charts are on the list.
      </h2>
      <p className="mt-4 text-[1.0625rem] leading-relaxed text-story-muted">
        How the scale is spread, which brands hold up across their whole range, whether price tracks quality at all. In
        the meantime the ranking answers most of it.
      </p>
    </div>

    {/* The scale the charts will eventually be drawn against. */}
    <ol aria-hidden className="mx-auto mt-10 flex max-w-xl gap-1.5">
      {SCORE_TIERS.map((tier) => (
        <li key={tier.key} className="flex-1">
          <span className="block h-2 rounded-full" style={{ backgroundColor: tier.color }} />
          <span className="mt-2 block text-center text-[0.625rem] font-bold uppercase tracking-[0.12em]" style={{ color: tier.color }}>
            {tier.name}
          </span>
        </li>
      ))}
    </ol>

    <div className="mt-10 flex justify-center">
      <StoryLinkButton to="/results" tone="outline" size="md">
        Back to the ranking
        <ArrowRight />
      </StoryLinkButton>
    </div>
  </div>
);
