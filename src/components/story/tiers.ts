/**
 * Score tiers for the public site.
 *
 * The community scores 0–10 and the site names those bands out loud —
 * "Waste" through "Gem" — because a named verdict sells the ratings in a way a
 * bare number never does. Colours are hex rather than tokens because they are
 * used inside SVG fills and inline styles where a Tailwind class cannot reach.
 */

export type ScoreTier = {
  key: "waste" | "poor" | "fair" | "good" | "gem";
  /** Inclusive lower bound. */
  min: number;
  /** Exclusive upper bound. */
  max: number;
  name: string;
  /** What the tier means, in the site's voice. */
  blurb: string;
  color: string;
  light: string;
};

export const SCORE_TIERS: ScoreTier[] = [
  { key: "waste", min: 0, max: 2, name: "Waste", blurb: "Down the sink.", color: "#d8453a", light: "#fde8e5" },
  { key: "poor", min: 2, max: 4, name: "Poor", blurb: "You'll finish it. Reluctantly.", color: "#e8843a", light: "#fdecdb" },
  { key: "fair", min: 4, max: 6, name: "Fair", blurb: "Fine. Just fine.", color: "#dba32a", light: "#fbf2d3" },
  { key: "good", min: 6, max: 8, name: "Good", blurb: "Worth the shelf space.", color: "#5bb14a", light: "#e6f4e1" },
  { key: "gem", min: 8, max: 10.01, name: "Gem", blurb: "Buy two.", color: "#00a455", light: "#d4f3e1" },
];

/**
 * What an unrated product gets. Deliberately outside SCORE_TIERS so the scale
 * still renders as five tiers — and deliberately grey and named, because
 * falling back to "Fair" told visitors a middling verdict existed when nobody
 * had voted at all.
 */
export const NO_SCORE_TIER: ScoreTier = {
  key: "fair",
  min: NaN,
  max: NaN,
  name: "Unrated",
  blurb: "Nobody has scored this one yet.",
  color: "#8a948f",
  light: "#eef2ef",
};

export const getTier = (score: number | null | undefined): ScoreTier => {
  if (score === null || score === undefined || Number.isNaN(score)) return NO_SCORE_TIER;
  return SCORE_TIERS.find((t) => score >= t.min && score < t.max) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
};

export type PriceQualityTier = {
  key: string;
  label: string;
  color: string;
  light: string;
};

export const PRICE_QUALITY_TIERS: PriceQualityTier[] = [
  { key: "overpriced", label: "Overpriced", color: "#d8453a", light: "#fde8e5" },
  { key: "pricey", label: "Pricey", color: "#e8843a", light: "#fdecdb" },
  { key: "fairprice", label: "Fair price", color: "#dba32a", light: "#fbf2d3" },
  { key: "goodvalue", label: "Good value", color: "#5bb14a", light: "#e6f4e1" },
  { key: "greatvalue", label: "Great value", color: "#00a455", light: "#d4f3e1" },
];

/**
 * The five values the database actually stores are `waste_of_money`,
 * `not_worth_it`, `fair_price`, `good_deal` and `great_value`. Everything else
 * here is a synonym kept so older or hand-entered rows still resolve rather
 * than silently vanishing from a product's price-quality breakdown.
 */
const PRICE_QUALITY_ALIASES: Record<string, string> = {
  "waste of money": "overpriced",
  overpriced: "overpriced",
  "not worth it": "pricey",
  pricey: "pricey",
  expensive: "pricey",
  "fair price": "fairprice",
  fairprice: "fairprice",
  fair: "fairprice",
  "good deal": "goodvalue",
  "good value": "goodvalue",
  goodvalue: "goodvalue",
  good: "goodvalue",
  "great value": "greatvalue",
  greatvalue: "greatvalue",
  great: "greatvalue",
  bargain: "greatvalue",
};

export const getPriceQuality = (raw: string | null | undefined): PriceQualityTier | null => {
  if (!raw) return null;
  const key = PRICE_QUALITY_ALIASES[raw.trim().toLowerCase().replace(/[_-]/g, " ")];
  return PRICE_QUALITY_TIERS.find((t) => t.key === key) ?? null;
};

/**
 * Plant bases the catalogue is sliced by on the public site. Kept in one place
 * so the home rail, the results filters and the type marks stay in step.
 */
export const MILK_BASES = [
  { key: "oat", label: "Oat", search: "Oat" },
  { key: "almond", label: "Almond", search: "Almond" },
  { key: "soy", label: "Soy", search: "Soy" },
  { key: "coconut", label: "Coconut", search: "Coconut" },
  { key: "rice", label: "Rice", search: "Rice" },
  { key: "hazelnut", label: "Hazelnut", search: "Hazelnut" },
  { key: "pea", label: "Pea", search: "Pea" },
  { key: "cashew", label: "Cashew", search: "Cashew" },
] as const;
