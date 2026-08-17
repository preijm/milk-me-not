import { describe, it, expect } from "vitest";
import { brandRanges, tierBins, priceQualityBins, withPriceVerdict, countryStats } from "./chartData";
import type { RatingFact } from "@/hooks/useRatingFacts";

const fact = (over: Partial<RatingFact> & { rating: number }): RatingFact => ({
  product_id: "p1",
  brand_name: "Alpro",
  product_name: "Oat",
  is_barista: null,
  price_quality_ratio: null,
  property_names: null,
  flavor_names: null,
  created_at: null,
  country_code: null,
  ...over,
});

const many = (brand: string, ratings: number[]) => ratings.map((rating) => fact({ brand_name: brand, rating }));

describe("brandRanges", () => {
  it("drops brands below the minimum sample", () => {
    const facts = [...many("Alpro", [8, 8, 8, 8, 8]), ...many("Oatly!", [10])];
    expect(brandRanges(facts).map((r) => r.brand)).toEqual(["Alpro"]);
  });

  it("reports the spread rather than only the average", () => {
    const [row] = brandRanges(many("Oatly!", [4, 6, 7, 9, 10]));
    expect(row.min).toBe(4);
    expect(row.max).toBe(10);
    expect(row.spread).toBe(6);
    expect(row.avg).toBeCloseTo(7.2);
  });

  it("orders by average, best first", () => {
    const facts = [...many("Low", [5, 5, 5, 5, 5]), ...many("High", [9, 9, 9, 9, 9])];
    expect(brandRanges(facts).map((r) => r.brand)).toEqual(["High", "Low"]);
  });

  it("breaks a tied average on the larger sample", () => {
    const facts = [...many("Small", [8, 8, 8, 8, 8]), ...many("Big", [8, 8, 8, 8, 8, 8, 8])];
    expect(brandRanges(facts).map((r) => r.brand)).toEqual(["Big", "Small"]);
  });

  it("ignores rows with no brand", () => {
    expect(brandRanges(many("", [8, 8, 8, 8, 8]))).toEqual([]);
  });
});

describe("tierBins", () => {
  it("puts each rating in its named tier", () => {
    const bins = tierBins([fact({ rating: 1 }), fact({ rating: 5 }), fact({ rating: 7 }), fact({ rating: 9 })]);
    const counts = Object.fromEntries(bins.map((b) => [b.tier.key, b.count]));
    expect(counts).toMatchObject({ waste: 1, poor: 0, fair: 1, good: 1, gem: 1 });
  });

  it("counts a perfect ten as a Gem rather than dropping it", () => {
    const bins = tierBins([fact({ rating: 10 })]);
    expect(bins.find((b) => b.tier.key === "gem")?.count).toBe(1);
  });

  it("always returns all five tiers, even with no data", () => {
    expect(tierBins([]).map((b) => b.tier.key)).toEqual(["waste", "poor", "fair", "good", "gem"]);
  });
});

describe("priceQualityBins", () => {
  it("averages the score at each price verdict and keeps the scale's order", () => {
    const bins = priceQualityBins([
      fact({ rating: 4, price_quality_ratio: "waste_of_money" }),
      fact({ rating: 9, price_quality_ratio: "great_value" }),
      fact({ rating: 8, price_quality_ratio: "great_value" }),
    ]);
    expect(bins.map((b) => b.tier.key)).toEqual(["overpriced", "greatvalue"]);
    expect(bins[1].avg).toBeCloseTo(8.5);
    expect(bins[1].n).toBe(2);
  });

  it("leaves out verdicts nobody gave", () => {
    expect(priceQualityBins([fact({ rating: 7 })])).toEqual([]);
  });
});

describe("withPriceVerdict", () => {
  it("counts only the ratings that carry a verdict", () => {
    const facts = [fact({ rating: 7 }), fact({ rating: 8, price_quality_ratio: "good_deal" })];
    expect(withPriceVerdict(facts)).toBe(1);
  });
});

describe("countryStats", () => {
  it("counts ratings per country, busiest first", () => {
    const facts = [
      fact({ rating: 8, country_code: "NL" }),
      fact({ rating: 7, country_code: "DE" }),
      fact({ rating: 9, country_code: "NL" }),
    ];
    expect(countryStats(facts).map((c) => [c.country_code, c.test_count])).toEqual([
      ["NL", 2],
      ["DE", 1],
    ]);
  });

  it("averages the score each country gave", () => {
    const facts = [
      fact({ rating: 6, country_code: "NL" }),
      fact({ rating: 9, country_code: "NL" }),
      fact({ rating: 7.5, country_code: "DE" }),
    ];
    const [nl, de] = countryStats(facts);
    expect(nl.avg).toBeCloseTo(7.5);
    expect(de.avg).toBeCloseTo(7.5);
  });

  it("leaves out ratings with no country, so the map never counts a blank one", () => {
    const facts = [fact({ rating: 8, country_code: null }), fact({ rating: 8, country_code: "  " }), fact({ rating: 7, country_code: "NL" })];
    expect(countryStats(facts).map((c) => c.country_code)).toEqual(["NL"]);
  });

  it("is empty when the current filter leaves nothing", () => {
    expect(countryStats([])).toEqual([]);
  });
});
