/**
 * Everything the public product page needs, derived from real rows.
 *
 * `useProductTests` already does the honest thing at the data layer: signed-out
 * visitors get anonymised rows (no note text, no username, no photo), signed-in
 * visitors get the full community record. This hook just shapes whatever comes
 * back into the numbers the page draws — average, named tier, a five-tier
 * histogram and a price-to-quality breakdown — so nothing on the page is
 * invented.
 */
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useProductTests } from "@/hooks/useProductTests";
import { useProductTestCount } from "@/hooks/useProductTestCount";
import { getPriceQuality, getTier, SCORE_TIERS, type ScoreTier, type PriceQualityTier } from "@/components/story";
import type { MilkTestResult } from "@/types/milk-test";

export type TierBin = { tier: ScoreTier; count: number };
export type PriceQualityBin = PriceQualityTier & { count: number };

export type ProductStory = {
  productId: string;
  brandName: string;
  productName: string;
  isBarista: boolean;
  properties: string[];
  flavors: string[];
  count: number;
  avgScore: number | null;
  tier: ScoreTier;
  histogram: TierBin[];
  histogramMax: number;
  priceQuality: PriceQualityBin[];
  topPriceQuality: PriceQualityBin | null;
  ratings: MilkTestResult[];
  notes: MilkTestResult[];
  isAuthed: boolean;
};

const DEFAULT_SORT = { column: "created_at", direction: "desc" as const };

/**
 * `getPriceQuality`'s alias table only recognises a handful of English
 * phrasings. The database's actual enum (`good_deal`, `not_worth_it`,
 * `waste_of_money`, …) doesn't fully overlap with it, so real rows would
 * silently map to nothing. Translate the known raw values into words the
 * shared alias table already understands rather than editing that shared
 * file.
 */
const RAW_PRICE_QUALITY_HINTS: Record<string, string> = {
  waste_of_money: "overpriced",
  not_worth_it: "pricey",
  fair_price: "fair price",
  good_deal: "good value",
  great_value: "great value",
};

export const resolvePriceQuality = (raw: string | null | undefined) => {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return getPriceQuality(RAW_PRICE_QUALITY_HINTS[key] ?? raw);
};

export const useProductStory = (productId: string | undefined) => {
  const { user } = useAuth();
  const { data: product, isLoading: isLoadingProduct, isError } = useProductDetails(productId);
  const { data: rows = [], isLoading: isLoadingRows } = useProductTests(productId ?? null, DEFAULT_SORT);
  const { data: realCount } = useProductTestCount(productId);

  const story = useMemo<ProductStory | null>(() => {
    if (!product) return null;

    const scored = rows.filter((r): r is MilkTestResult & { rating: number } => typeof r.rating === "number");
    const avgScore = scored.length ? scored.reduce((sum, r) => sum + r.rating, 0) / scored.length : null;

    const histogram: TierBin[] = SCORE_TIERS.map((tier) => ({
      tier,
      count: scored.filter((r) => r.rating >= tier.min && r.rating < tier.max).length,
    }));
    const histogramMax = Math.max(1, ...histogram.map((b) => b.count));

    const pqCounts = new Map<string, number>();
    rows.forEach((r) => {
      const tier = resolvePriceQuality(r.price_quality_ratio);
      if (!tier) return;
      pqCounts.set(tier.key, (pqCounts.get(tier.key) ?? 0) + 1);
    });
    const priceQuality: PriceQualityBin[] = Array.from(pqCounts.entries())
      .map(([key, count]) => {
        const tier = getPriceQuality(key);
        return tier ? { ...tier, count } : null;
      })
      .filter((b): b is PriceQualityBin => !!b)
      .sort((a, b) => b.count - a.count);
    const topPriceQuality = priceQuality[0] ?? null;

    const notes = rows.filter((r) => !!r.notes && r.notes.trim().length > 0);

    return {
      productId: product.id ?? productId ?? "",
      brandName: product.brand_name || "Unknown brand",
      productName: product.product_name || "Unknown product",
      isBarista: !!product.is_barista,
      properties: product.property_names ?? [],
      flavors: product.flavor_names ?? [],
      count: realCount ?? scored.length,
      avgScore,
      tier: getTier(avgScore),
      histogram,
      histogramMax,
      priceQuality,
      topPriceQuality,
      ratings: rows,
      notes,
      isAuthed: !!user,
    };
  }, [product, rows, realCount, user, productId]);

  return {
    story,
    isLoading: isLoadingProduct || isLoadingRows,
    notFound: !isLoadingProduct && !isError && !product,
  };
};
