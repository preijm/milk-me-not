/**
 * One row per brand, folded out of the same rating facts the board reads.
 *
 * Deliberately not `brandRanges` from the charts: that drops every brand under
 * five ratings, because a bar chart ranked by average would otherwise lead
 * with its least reliable rows. An index of brands has the opposite job — the
 * brands with one rating are exactly the ones a reader cannot find anywhere
 * else — so nothing is filtered out here and the sort leads with evidence
 * rather than score.
 */
import type { RatingFact } from "@/hooks/useRatingFacts";

export type BrandSummary = {
  brand: string;
  /** Ratings, which is what the ordering means. */
  n: number;
  /** Distinct products the board has seen from this brand. */
  products: number;
  avg: number;
  min: number;
  max: number;
  /**
   * The most recent rating, which is the closest thing the board has to a
   * sign of life. A brand nobody has rated in two years is not proof of
   * anything — but it is where you would look first.
   */
  latest: string | null;
};

export type BrandProduct = {
  productId: string | null;
  product: string;
  n: number;
  avg: number;
  isBarista: boolean;
};

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/**
 * Every brand on the board, most-rated first.
 *
 * Ties break on the average and then the name, so the order is stable across
 * renders — an index that reshuffles between visits is not an index.
 */
export const brandSummaries = (facts: RatingFact[]): BrandSummary[] => {
  const groups = new Map<string, { ratings: number[]; products: Set<string>; latest: string | null }>();

  for (const fact of facts) {
    const name = fact.brand_name?.trim();
    if (!name) continue;
    let bucket = groups.get(name);
    if (!bucket) groups.set(name, (bucket = { ratings: [], products: new Set(), latest: null }));
    bucket.ratings.push(fact.rating);
    if (fact.product_id) bucket.products.add(fact.product_id);
    // String comparison is safe and cheap on ISO-8601, which is what the RPC
    // returns; parsing 350 dates to find a maximum would not buy anything.
    if (fact.created_at && (!bucket.latest || fact.created_at > bucket.latest)) {
      bucket.latest = fact.created_at;
    }
  }

  return [...groups]
    .map(([brand, { ratings, products, latest }]) => ({
      brand,
      n: ratings.length,
      products: products.size,
      avg: mean(ratings),
      min: Math.min(...ratings),
      max: Math.max(...ratings),
      latest,
    }))
    .sort((a, b) => b.n - a.n || b.avg - a.avg || a.brand.localeCompare(b.brand));
};

/** The products one brand has on the board, best first. */
export const productsForBrand = (facts: RatingFact[], brand: string): BrandProduct[] => {
  const wanted = brand.trim().toLowerCase();
  const groups = new Map<string, { name: string; id: string | null; ratings: number[]; barista: boolean }>();

  for (const fact of facts) {
    if ((fact.brand_name ?? "").trim().toLowerCase() !== wanted) continue;
    const name = fact.product_name?.trim() || "Unknown product";
    // Keyed by product id where there is one, so two cartons that happen to
    // share a name stay two rows.
    const key = fact.product_id ?? `name:${name.toLowerCase()}`;
    let bucket = groups.get(key);
    if (!bucket) {
      groups.set(key, (bucket = { name, id: fact.product_id, ratings: [], barista: false }));
    }
    bucket.ratings.push(fact.rating);
    if (fact.is_barista) bucket.barista = true;
  }

  return [...groups.values()]
    .map(({ name, id, ratings, barista }) => ({
      productId: id,
      product: name,
      n: ratings.length,
      avg: mean(ratings),
      isBarista: barista,
    }))
    .sort((a, b) => b.avg - a.avg || b.n - a.n || a.product.localeCompare(b.product));
};

/** The board's spelling of a brand, found from a slug. */
export const findBrandName = (
  facts: RatingFact[],
  slug: string,
  toSlug: (name: string) => string,
): string | null => {
  for (const fact of facts) {
    const name = fact.brand_name?.trim();
    if (name && toSlug(name) === slug) return name;
  }
  return null;
};
