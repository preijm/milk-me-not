import { Band, Display, Kicker, Lede, MilkDrop, SCORE_TIERS, StatFigure } from "@/components/story";
import { MemberPageHead } from "@/components/story/MemberPageHead";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
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
/**
 * The key to the word on every row below — Gem, Good, Fair, Poor, Waste. This
 * is reference, not pitch, so a member keeps it even though the hero around it
 * goes away on a phone.
 *
 * Wraps rather than scrolls. As a hidden-scrollbar rail it clipped mid-pill at
 * the viewport edge with no affordance, which reads as a broken layout rather
 * than something you can swipe. Five short pills fit two rows on a phone.
 */
const ScoreLegend = ({ className }: { className?: string }) => (
  <div className={cn("relative flex flex-wrap gap-2", className)}>
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
);

export const ResultsHero = ({ stats, isLoading }: ResultsHeroProps) => {
  const { user } = useAuth();
  const figures = [
    { value: isLoading ? "—" : formatCount(stats.products), label: "Products scored" },
    { value: isLoading ? "—" : formatCount(stats.ratings), label: "Honest ratings" },
    { value: isLoading ? "—" : formatCount(stats.brands), label: "Brands covered" },
  ];

  return (
    <>
      {/* The score legend stays with the compact head: it is the key to the
          word on every row below, so it is reference rather than pitch. */}
      {user && (
        <MemberPageHead
          kicker="The full catalogue"
          title="Every plant milk"
          meta={isLoading ? "Loading the shelf…" : `${formatCount(stats.products)} products, ${formatCount(stats.ratings)} ratings`}
          className="lg:hidden"
        />
      )}
      {user && (
        <div className="mx-auto w-full max-w-[76rem] px-5 pb-4 sm:px-8 lg:hidden">
          <ScoreLegend />
        </div>
      )}

    <Band ground="cream" size="md" className={cn("pt-6 sm:pt-10", user && "hidden lg:block")}>
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

      <ScoreLegend className="mt-9" />
    </Band>
    </>
  );
};
