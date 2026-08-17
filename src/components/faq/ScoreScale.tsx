/**
 * The scale, drawn — not described.
 *
 * This is the graphic the whole FAQ page hangs off: the same 0–10 line every
 * rating on the site lands on, at a size big enough to read as a real thing
 * rather than a table row. Desktop gets one continuous bar so the five tiers
 * read as one scale; a phone gets the same five tiers stacked as full-width
 * blocks, because a bar five-across at 390px would shrink each name to
 * nothing.
 */

import { SCORE_TIERS } from "@/components/story";

const EXAMPLE_SCORE = 7.4;
const exampleTier = SCORE_TIERS.find((t) => EXAMPLE_SCORE >= t.min && EXAMPLE_SCORE < t.max) ?? SCORE_TIERS[3];

const rangeLabel = (tier: (typeof SCORE_TIERS)[number]) =>
  `${tier.min.toFixed(0)}–${tier.key === "gem" ? "10" : tier.max.toFixed(0)}`;

export const ScoreScale = () => (
  <div className="mt-10">
    {/* Desktop / tablet — one continuous bar, five equal segments. */}
    <div className="relative hidden sm:block">
      <div
        aria-hidden
        className="absolute bottom-full mb-3 flex -translate-x-1/2 flex-col items-center"
        style={{ left: `${(EXAMPLE_SCORE / 10) * 100}%` }}
      >
        <span className="whitespace-nowrap rounded-full bg-story-ink px-3.5 py-1.5 text-[0.75rem] font-bold text-story-cream">
          A {EXAMPLE_SCORE.toFixed(1)} lands here → {exampleTier.name}
        </span>
        <svg width="14" height="8" viewBox="0 0 14 8" className="text-story-ink">
          <path d="M0 0h14L7 8Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex overflow-hidden rounded-[1.75rem] story-hairline" role="img" aria-label="Score scale from zero to ten, divided into five tiers: Waste, Poor, Fair, Good and Gem.">
        {SCORE_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex flex-1 flex-col items-center justify-center gap-1.5 py-9"
            style={{ backgroundColor: tier.color }}
          >
            <span className="story-num text-[0.8125rem] text-story-ink/60">{rangeLabel(tier)}</span>
            <span className="story-serif text-[1.55rem] font-bold leading-none text-story-ink">{tier.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex">
        {SCORE_TIERS.map((tier) => (
          <span key={tier.key} className="flex-1 px-3 text-center text-[0.8125rem] leading-snug text-story-muted">
            {tier.blurb}
          </span>
        ))}
      </div>
    </div>

    {/* Phone — five full-width blocks, still colour and still real size. */}
    <ul className="flex flex-col gap-2.5 sm:hidden">
      {SCORE_TIERS.map((tier) => (
        <li
          key={tier.key}
          className="flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ backgroundColor: tier.color }}
        >
          <span className="story-num w-12 flex-shrink-0 text-[1rem] text-story-ink/60">{rangeLabel(tier)}</span>
          <div className="min-w-0">
            <p className="story-serif text-[1.25rem] font-bold leading-none text-story-ink">{tier.name}</p>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-story-ink/70">{tier.blurb}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ScoreScale;
