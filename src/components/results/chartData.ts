/**
 * Aggregations behind the charts view.
 *
 * Kept as pure functions on plain rows so they can be tested without a network
 * or a renderer, and so the charts stay dumb about how a number was reached.
 */
import type { RatingFact } from "@/hooks/useRatingFacts";
import { SCORE_TIERS, PRICE_QUALITY_TIERS, getPriceQuality, type ScoreTier, type PriceQualityTier } from "@/components/story";

/**
 * A brand needs this many ratings before it earns a row.
 *
 * Twenty-one of the seventy-one brands have exactly one rating. Ranking those
 * by average puts a single opinion above a brand with fifty, so the chart would
 * lead with its least reliable rows. Five is low enough to keep two thirds of
 * the ratings on screen and high enough that a row means something.
 */
export const MIN_RATINGS_PER_BRAND = 5;

export type BrandRange = {
  brand: string;
  n: number;
  avg: number;
  min: number;
  max: number;
  /** max − min. The point of the chart: how consistent the brand is. */
  spread: number;
};

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

const groupRatings = (facts: RatingFact[], key: (f: RatingFact) => string | null) => {
  const groups = new Map<string, number[]>();
  for (const fact of facts) {
    const k = key(fact);
    if (!k) continue;
    const bucket = groups.get(k);
    if (bucket) bucket.push(fact.rating);
    else groups.set(k, [fact.rating]);
  }
  return groups;
};

/**
 * Every brand with enough ratings to be worth plotting, best average first.
 *
 * Ties break on the larger sample, so the better-evidenced brand sits higher.
 */
export const brandRanges = (facts: RatingFact[], minRatings = MIN_RATINGS_PER_BRAND): BrandRange[] =>
  [...groupRatings(facts, (f) => f.brand_name)]
    .filter(([, ratings]) => ratings.length >= minRatings)
    .map(([brand, ratings]) => {
      const min = Math.min(...ratings);
      const max = Math.max(...ratings);
      return { brand, n: ratings.length, avg: mean(ratings), min, max, spread: max - min };
    })
    .sort((a, b) => b.avg - a.avg || b.n - a.n || a.brand.localeCompare(b.brand));

export type TierBin = { tier: ScoreTier; count: number };

/** Every rating dropped into its named tier, Waste first. */
export const tierBins = (facts: RatingFact[]): TierBin[] =>
  SCORE_TIERS.map((tier) => ({
    tier,
    count: facts.filter((f) => f.rating >= tier.min && f.rating < tier.max).length,
  }));

export type PriceQualityBin = {
  tier: PriceQualityTier;
  n: number;
  avg: number;
};

/**
 * Average score at each price verdict, cheapest-feeling first.
 *
 * Three quarters of ratings never got a price verdict, so this runs on the
 * quarter that did and the caller is expected to say so out loud.
 */
export const priceQualityBins = (facts: RatingFact[]): PriceQualityBin[] => {
  const groups = groupRatings(facts, (f) => getPriceQuality(f.price_quality_ratio)?.key ?? null);
  return PRICE_QUALITY_TIERS.map((tier) => {
    const ratings = groups.get(tier.key) ?? [];
    return { tier, n: ratings.length, avg: ratings.length ? mean(ratings) : 0 };
  }).filter((bin) => bin.n > 0);
};

/** How many ratings carry a price verdict at all. */
export const withPriceVerdict = (facts: RatingFact[]): number =>
  facts.filter((f) => getPriceQuality(f.price_quality_ratio)).length;

export type CountryStat = {
  country_code: string;
  /** Kept as `test_count` because the map's fill expression reads it. */
  test_count: number;
  avg: number;
};

/**
 * How much each country has rated, and how generously, busiest first.
 *
 * The map used to run its own query straight at `milk_tests`, which is why it
 * sat behind the same search and filters as everything else and quietly
 * ignored them. Counting the same rows the rest of the page is looking at
 * keeps all three views describing one slice.
 */
export const countryStats = (facts: RatingFact[]): CountryStat[] => {
  const groups = groupRatings(facts, (f) => f.country_code?.trim() || null);
  return [...groups]
    .map(([country_code, ratings]) => ({
      country_code,
      test_count: ratings.length,
      avg: mean(ratings),
    }))
    .sort((a, b) => b.test_count - a.test_count || a.country_code.localeCompare(b.country_code));
};

/**
 * A country needs this many ratings before its average is worth quoting.
 *
 * Every country still gets a row — the list is about who is reporting back —
 * but calling somewhere the harshest crowd on the strength of three ratings
 * would be inventing a national character out of one person's afternoon.
 */
export const MIN_RATINGS_PER_COUNTRY = 10;
