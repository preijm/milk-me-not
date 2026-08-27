/**
 * The scale, drawn — not described.
 *
 * This is the graphic the whole FAQ page hangs off: the same 0–10 line every
 * rating on the site lands on, at a size big enough to read as a real thing
 * rather than a table row. Desktop gets one continuous bar so the five tiers
 * read as one scale; a phone gets the same five tiers stacked, because a bar
 * five-across at 390px would shrink each name to nothing.
 *
 * The words sit beside the colour rather than on top of it, and that is the
 * whole reason this looks like it does.
 *
 * They used to be printed inside the bars, which forced the bars to be dark
 * enough to carry them: the range and the tier name sat directly on the fill,
 * and on the vivid waste red neither ink (3.7:1) nor white (4.35:1) cleared
 * AA. The contrast pass solved that by swapping the fill to `tier.ink` — so
 * the one graphic on the site whose entire job is to show what each tier looks
 * like was showing the muted version, while every chart, the world map and the
 * drop kept the vivid one.
 *
 * Moving the labels off the fill dissolves the trade. The bars are `tier.color`
 * again, exactly as they appear everywhere else, and the words are on the
 * page's own ground where legibility costs nothing — the names in `tier.ink`,
 * which is the same hue at a readable depth, so each tier still has its colour
 * in the text.
 */

import { SCORE_TIERS } from "@/components/story";

const EXAMPLE_SCORE = 7.4;
const exampleTier = SCORE_TIERS.find((t) => EXAMPLE_SCORE >= t.min && EXAMPLE_SCORE < t.max) ?? SCORE_TIERS[3];

const rangeLabel = (tier: (typeof SCORE_TIERS)[number]) =>
  `${tier.min.toFixed(0)}–${tier.key === "gem" ? "10" : tier.max.toFixed(0)}`;

const SCALE_LABEL =
  "Score scale from zero to ten, divided into five tiers: Waste, Poor, Fair, Good and Gem.";

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

      <div className="story-hairline flex h-20 overflow-hidden rounded-[1.75rem]" role="img" aria-label={SCALE_LABEL}>
        {SCORE_TIERS.map((tier) => (
          <div key={tier.key} className="flex-1" style={{ backgroundColor: tier.color }} />
        ))}
      </div>

      <div className="mt-4 flex">
        {SCORE_TIERS.map((tier) => (
          <div key={tier.key} className="flex-1 px-3 text-center">
            <p className="story-num text-[0.8125rem] text-story-muted-2">{rangeLabel(tier)}</p>
            <p
              className="story-serif mt-1 text-[1.35rem] font-bold leading-none"
              style={{ color: tier.ink }}
            >
              {tier.name}
            </p>
            <p className="mt-2 text-[0.8125rem] leading-snug text-story-muted">{tier.blurb}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Phone — the same five tiers stacked, colour still at real size. */}
    <ul className="flex flex-col gap-3 sm:hidden" aria-label={SCALE_LABEL}>
      {SCORE_TIERS.map((tier) => (
        <li key={tier.key} className="flex items-center gap-4">
          <span
            aria-hidden
            className="story-hairline h-14 w-14 shrink-0 rounded-2xl"
            style={{ backgroundColor: tier.color }}
          />
          <div className="min-w-0">
            <p className="flex items-baseline gap-2.5">
              <span className="story-serif text-[1.25rem] font-bold leading-none" style={{ color: tier.ink }}>
                {tier.name}
              </span>
              <span className="story-num text-[0.8125rem] text-story-muted-2">{rangeLabel(tier)}</span>
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-story-muted">{tier.blurb}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ScoreScale;
