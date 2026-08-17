/**
 * The charts view.
 *
 * Three fixed questions rather than a chart picker: the ranking answers "which
 * one", these answer "what does the board look like". They stack and scroll —
 * with only three, a switcher would cost a click and hide two of them.
 *
 * Everything here is scoped to the same slice as the ranking. Rather than
 * reimplement the filters against the raw rows, it keeps the ratings whose
 * product survived the existing product-level filtering, so the two views can
 * never disagree.
 */
import { useMemo } from "react";
import { StoryCard } from "@/components/story";
import { useRatingFacts } from "@/hooks/useRatingFacts";
// The product page already draws a tier histogram exactly like this one, and it
// is the same chart of the same five tiers — so it is borrowed rather than
// grown a second time.
import { ScoreDistribution } from "@/components/product/ScoreDistribution";
import { brandRanges, tierBins, priceQualityBins, withPriceVerdict, MIN_RATINGS_PER_BRAND } from "./chartData";
import { BrandRangeChart } from "./BrandRangeChart";
import { PriceLadderChart } from "./PriceLadderChart";

const ChartCard = ({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  children: React.ReactNode;
}) => (
  <StoryCard as="article" className="px-5 py-7 sm:px-8 sm:py-9">
    <p className="story-kicker text-story-green-dark">{kicker}</p>
    <h3 className="story-display mt-3 text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-story-ink">{title}</h3>
    <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-story-muted">{lede}</p>
    <div className="mt-8">{children}</div>
  </StoryCard>
);

export const ResultsCharts = ({ visibleProductIds }: { visibleProductIds: Set<string> }) => {
  const { data: facts = [], isLoading } = useRatingFacts();

  const scoped = useMemo(
    () => facts.filter((f) => f.product_id && visibleProductIds.has(f.product_id)),
    [facts, visibleProductIds],
  );

  const brands = useMemo(() => brandRanges(scoped), [scoped]);
  const bins = useMemo(() => tierBins(scoped), [scoped]);
  const ladder = useMemo(() => priceQualityBins(scoped), [scoped]);

  const total = scoped.length;
  const histogramMax = Math.max(1, ...bins.map((b) => b.count));
  const goodOrBetter = bins
    .filter((b) => b.tier.key === "good" || b.tier.key === "gem")
    .reduce((sum, b) => sum + b.count, 0);
  const goodShare = total ? Math.round((goodOrBetter / total) * 100) : 0;
  const priced = withPriceVerdict(scoped);

  if (isLoading) {
    return (
      <div className="story-hairline h-64 animate-pulse rounded-[1.5rem] bg-white" aria-hidden />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ChartCard
        kicker="Who holds up"
        title="A good average is not the same as a safe buy"
        lede={
          <>
            Every brand here has at least {MIN_RATINGS_PER_BRAND} ratings. The bar is the full span between its worst
            and best score, so a brand that is reliably fine looks very different from one that is brilliant half the
            time.
          </>
        }
      >
        <BrandRangeChart rows={brands} minRatings={MIN_RATINGS_PER_BRAND} />
      </ChartCard>

      <ChartCard
        kicker="The whole scale"
        title="Nearly everything lands in the top half"
        lede={
          <>
            {goodShare}% of the {total} ratings in this slice are Good or better, and the bottom two tiers are almost
            empty. People mostly bother to rate what they were willing to buy — so treat the difference between an 8
            and a 9 as the real signal, not the distance from zero.
          </>
        }
      >
        <ScoreDistribution bins={bins} max={histogramMax} />
      </ChartCard>

      <ChartCard
        kicker="Price against taste"
        title="The cheap ones are not the bad ones"
        lede={
          <>
            Rating by rating, what someone thought of the price against what they thought of the drink. The two track
            each other almost perfectly — but that is people rewarding a fair price, not an expensive carton tasting
            better.
          </>
        }
      >
        <PriceLadderChart bins={ladder} scored={priced} total={total} />
      </ChartCard>
    </div>
  );
};

export default ResultsCharts;
