import { Band, Display, Kicker, Lede, MilkDrop, SCORE_TIERS, StatFigure } from "@/components/story";
import { formatCount, type CatalogueStats } from "./resultsStats";

type ResultsHeroProps = {
  stats: CatalogueStats;
  isLoading: boolean;
};

/**
 * Opens the discovery page as a real editorial band: what the catalogue is,
 * how big it is, and what the score scale means, before a single row of
 * data appears.
 */
export const ResultsHero = ({ stats, isLoading }: ResultsHeroProps) => {
  const figures = [
    { value: isLoading ? "—" : formatCount(stats.products), label: "Products scored" },
    { value: isLoading ? "—" : formatCount(stats.ratings), label: "Honest ratings" },
    { value: isLoading ? "—" : formatCount(stats.brands), label: "Brands covered" },
  ];

  return (
    <Band ground="cream" size="md" className="pt-6 sm:pt-10">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-14 hidden lg:block">
        <div className="relative h-64 w-64 overflow-hidden rounded-full bg-story-green">
          <span className="absolute right-3 top-7 text-story-green-light">
            <MilkDrop size={150} variant="solid" />
          </span>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Kicker>The full catalogue</Kicker>
        <Display as="h1" size="xl" className="mt-4 text-story-ink">
          Every plant milk
          <br />
          anyone bothered to score.
        </Display>
        <Lede className="mt-5">
          {isLoading
            ? "Loading the shelf…"
            : `${formatCount(stats.products)} products, ${formatCount(stats.ratings)} ratings, ${formatCount(stats.brands)} brands — ranked by taste, coffee performance and price. No brand has ever bought a place on this list.`}
        </Lede>
      </div>

      <dl className="relative mt-9 grid max-w-lg grid-cols-3 gap-6 border-t border-story-ink/[0.08] pt-7">
        {figures.map((f) => (
          <StatFigure key={f.label} value={f.value} label={f.label} />
        ))}
      </dl>

      {/* Wraps rather than scrolls. As a hidden-scrollbar rail this clipped
          mid-pill at the viewport edge with no affordance, which reads as a
          broken layout rather than something you can swipe. Five short pills
          fit two rows on a phone. */}
      <div className="relative mt-9 flex flex-wrap gap-2">
        {SCORE_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex flex-shrink-0 items-center gap-2 rounded-full py-2 pl-2.5 pr-3.5"
            style={{ backgroundColor: tier.light }}
          >
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tier.color }} />
            <span className="text-[0.75rem] font-bold" style={{ color: tier.color }}>
              {tier.name}
            </span>
            <span className="text-[0.75rem] font-medium" style={{ color: tier.color, opacity: 0.6 }}>
              {tier.min.toFixed(0)}–{tier.key === "gem" ? "10" : tier.max.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </Band>
  );
};
