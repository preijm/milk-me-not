/**
 * The title and description of a product page.
 *
 * Two things need them: `ProductDetails`, whose `<Seo>` sets them once React
 * has run, and the build, which stamps them into `product/<id>.html` so that
 * the raw file Google reads first already names the product. Before that file
 * existed, every product URL was served the bare `index.html` — the home
 * page's title, an `og:url` of the home page, no canonical — and in November
 * 2026 Search Console filed them as "duplicate without user-selected
 * canonical". Sharing the wording here keeps the file and the page in step.
 *
 * Relative imports only, and only of files with no imports of their own: the
 * build loads this from vite.config.ts and the sitemap script in Node, where
 * the `@/` alias does not exist.
 */
import { getTier } from "../components/story/tiers";

export interface ProductSeoFacts {
  brandName: string;
  productName: string;
  count: number;
  avgScore: number | null;
}

export interface ProductSeo {
  title: string;
  description: string;
}

export const productSeo = ({ brandName, productName, count, avgScore }: ProductSeoFacts): ProductSeo => ({
  title: `${brandName} ${productName} — Reviews | Milk Me Not`,
  description: count
    ? `See ${count} community rating${count === 1 ? "" : "s"} of ${brandName} ${productName} on Milk Me Not — average score ${
        avgScore?.toFixed(1) ?? "—"
      }/10, rated ${getTier(avgScore).name}.`
    : `Be the first to rate ${brandName} ${productName} on Milk Me Not.`,
});

/** One rating, with the fields a head needs, as `get_aggregated_milk_tests` returns it. */
export interface ProductRatingRow {
  product_id: string | null;
  brand_name?: string | null;
  product_name?: string | null;
  rating?: number | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A head per rated product, keyed by product id — the same set of products the
 * sitemap lists, so every `<loc>` there has a file of its own.
 *
 * The average is over the rows that carry a number, as `useProductStory`
 * computes it. The count is every row, which can differ by a rating or two
 * from what the page shows once it has loaded; the page's own `<Seo>` then
 * replaces it, and the canonical — the part that matters here — is identical.
 */
export const productHeads = (rows: ProductRatingRow[] | null): Record<string, ProductSeo> => {
  if (!rows) return {};

  const byId = new Map<string, { brand: string; product: string; count: number; sum: number; scored: number }>();
  for (const row of rows) {
    const id = row.product_id;
    if (!id || !UUID.test(id)) continue;

    const acc = byId.get(id) ?? {
      brand: row.brand_name || "Unknown brand",
      product: row.product_name || "Unknown product",
      count: 0,
      sum: 0,
      scored: 0,
    };
    acc.count += 1;
    if (typeof row.rating === "number" && !Number.isNaN(row.rating)) {
      acc.sum += row.rating;
      acc.scored += 1;
    }
    byId.set(id, acc);
  }

  // Sorted by id so that two builds of the same data produce the same output.
  return Object.fromEntries(
    [...byId.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([id, a]) => [
        id,
        productSeo({
          brandName: a.brand,
          productName: a.product,
          count: a.count,
          avgScore: a.scored ? a.sum / a.scored : null,
        }),
      ]),
  );
};
