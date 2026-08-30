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
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/story";
import { ResultsPanel } from "./ResultsPanel";
import { useRatingFacts } from "@/hooks/useRatingFacts";
// The product page already draws a tier histogram exactly like this one, and it
// is the same chart of the same five tiers — so it is borrowed rather than
// grown a second time.
import { ScoreDistribution } from "@/components/product/ScoreDistribution";
import { brandRanges, tierBins, priceQualityBins, withPriceVerdict, MIN_RATINGS_PER_BRAND } from "./chartData";
import { BrandRangeChart } from "./BrandRangeChart";
import { PriceLadderChart } from "./PriceLadderChart";

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
      <div className="story-hairline h-64 animate-pulse rounded-3xl bg-white" aria-hidden />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ResultsPanel
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
        {/* This chart shows the brands with a real sample. The rest of them —
            the two-thirds under the minimum — exist and are worth reaching,
            so the way out is here rather than in the header nav. */}
        <Link
          to="/brands"
          className="mt-6 inline-flex items-center gap-2 text-[0.875rem] font-bold text-story-green-dark no-underline hover:underline"
        >
          Every brand on the board
          <ArrowRight />
        </Link>
      </ResultsPanel>

      <ResultsPanel
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
      </ResultsPanel>

      <ResultsPanel
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
      </ResultsPanel>
    </div>
  );
};

export default ResultsCharts;
