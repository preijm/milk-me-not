import { describe, it, expect } from "vitest";
import { brandSummaries, productsForBrand, findBrandName } from "./brandSummary";
import { brandSlug } from "@/lib/brandLogo";
import type { RatingFact } from "@/hooks/useRatingFacts";

const fact = (over: Partial<RatingFact>): RatingFact => ({
  product_id: null,
  brand_name: null,
  product_name: null,
  rating: 7,
  is_barista: null,
  price_quality_ratio: null,
  property_names: null,
  flavor_names: null,
  created_at: null,
  country_code: null,
  ...over,
});

const FACTS: RatingFact[] = [
  fact({ brand_name: "Alpro", product_name: "Oat", product_id: "a1", rating: 8 }),
  fact({ brand_name: "Alpro", product_name: "Oat", product_id: "a1", rating: 6 }),
  fact({ brand_name: "Alpro", product_name: "Soya", product_id: "a2", rating: 9, is_barista: true }),
  fact({ brand_name: "Wunda", product_name: "Original", product_id: "w1", rating: 7 }),
  fact({ brand_name: "  Alpro  ", product_name: "Oat", product_id: "a1", rating: 4 }),
  fact({ brand_name: null, product_name: "Orphan", rating: 10 }),
];

describe("brandSummaries", () => {
  const rows = brandSummaries(FACTS);

  it("leads with the best-evidenced brand, not the best-scoring one", () => {
    // Wunda's single 7 beats Alpro's average, and must not come first.
    expect(rows[0].brand).toBe("Alpro");
    expect(rows[0].n).toBe(4);
  });

  it("counts distinct products rather than ratings", () => {
    expect(rows[0].products).toBe(2);
  });

  it("folds the same brand written with stray whitespace into one row", () => {
    expect(rows.filter((r) => r.brand.trim() === "Alpro")).toHaveLength(1);
  });

  it("drops ratings with no brand rather than inventing one", () => {
    expect(rows.some((r) => r.brand.includes("Orphan"))).toBe(false);
    expect(rows).toHaveLength(2);
  });

  it("keeps brands with a single rating — that is the point of an index", () => {
    expect(rows.find((r) => r.brand === "Wunda")?.n).toBe(1);
  });
});

describe("productsForBrand", () => {
  it("groups a brand's ratings by product, best first", () => {
    const products = productsForBrand(FACTS, "Alpro");
    expect(products.map((p) => p.product)).toEqual(["Soya", "Oat"]);
    expect(products[1].n).toBe(3);
    expect(products[1].avg).toBeCloseTo(6);
  });

  it("carries barista through from any rating of that product", () => {
    expect(productsForBrand(FACTS, "Alpro")[0].isBarista).toBe(true);
  });

  it("matches the brand however it is cased or padded", () => {
    expect(productsForBrand(FACTS, "  alpro ")).toHaveLength(2);
  });
});

describe("findBrandName", () => {
  it("recovers the board's own spelling from a slug", () => {
    expect(findBrandName(FACTS, "alpro", brandSlug)).toBe("Alpro");
    expect(findBrandName(FACTS, "wunda", brandSlug)).toBe("Wunda");
  });

  it("returns null for a slug nothing matches", () => {
    expect(findBrandName(FACTS, "nope", brandSlug)).toBeNull();
  });
});
