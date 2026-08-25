import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RatingFact } from "./useRatingFacts";

/**
 * The numbers on the leaderboard.
 *
 * Every rating anyone has left arrives here as one flat row per rating, and
 * leaves as one row per product with an average and a count. Nothing about
 * that is type-checked — an averaging mistake produces a number, a sort
 * mistake produces an order, and both look entirely plausible on the page.
 * This is the board's headline figure, so it is worth stating what it should
 * be rather than trusting that it still is.
 */

const facts = vi.hoisted(() => ({ rows: [] as unknown[] }));

vi.mock("./useRatingFacts", () => ({
  RATING_FACTS_KEY: ["milk-tests-facts"],
  fetchRatingFacts: async () => facts.rows,
}));

const { useAggregatedResults } = await import("./useAggregatedResults");

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const fact = (over: Partial<RatingFact> = {}): RatingFact =>
  ({
    product_id: "p1",
    brand_name: "Alpro",
    product_name: "Oat",
    rating: 4,
    created_at: "2026-08-01T00:00:00Z",
    property_names: [],
    flavor_names: [],
    is_barista: false,
    ...over,
  }) as RatingFact;

const aggregate = async (rows: RatingFact[], column = "avg_rating", direction: "asc" | "desc" = "desc") => {
  facts.rows = rows;
  const { result } = renderHook(() => useAggregatedResults({ column, direction }), { wrapper });
  await waitFor(() => expect(result.current.data).toBeDefined());
  return result.current.data!;
};

describe("useAggregatedResults", () => {
  beforeEach(() => {
    facts.rows = [];
  });

  describe("averaging", () => {
    it("collapses every rating of a product into one row", async () => {
      const data = await aggregate([fact({ rating: 5 }), fact({ rating: 4 }), fact({ rating: 3 })]);

      expect(data).toHaveLength(1);
      expect(data[0].count).toBe(3);
      expect(data[0].avg_rating).toBeCloseTo(4, 10);
    });

    it("keeps an average that does not divide evenly honest", async () => {
      // Accumulated one rating at a time rather than summed, so this is where
      // a running-average mistake would show up.
      const data = await aggregate([fact({ rating: 5 }), fact({ rating: 4 }), fact({ rating: 4 })]);
      expect(data[0].avg_rating).toBeCloseTo(13 / 3, 10);
    });

    it("keeps products apart", async () => {
      const data = await aggregate([
        fact({ rating: 5 }),
        fact({ product_id: "p2", product_name: "Soya", rating: 1 }),
      ]);

      expect(data).toHaveLength(2);
      expect(data.find((d) => d.product_id === "p1")?.avg_rating).toBe(5);
      expect(data.find((d) => d.product_id === "p2")?.avg_rating).toBe(1);
    });

    it("ignores a rating attached to no product", async () => {
      const data = await aggregate([fact(), fact({ product_id: null as unknown as string })]);
      expect(data).toHaveLength(1);
      expect(data[0].count).toBe(1);
    });

    it("takes the latest date, whatever order the ratings arrive in", async () => {
      const data = await aggregate([
        fact({ created_at: "2026-08-01T00:00:00Z" }),
        fact({ created_at: "2026-08-20T00:00:00Z" }),
        fact({ created_at: "2026-08-10T00:00:00Z" }),
      ]);
      expect(data[0].most_recent_date).toBe("2026-08-20T00:00:00Z");
    });

    it("names a product that arrived without one, rather than rendering a blank row", async () => {
      const data = await aggregate([fact({ brand_name: null as unknown as string, product_name: "" })]);
      expect(data[0].brand_name).toBe("Unknown Brand");
      expect(data[0].product_name).toBe("Unknown Product");
    });
  });

  describe("sorting", () => {
    const three = [
      fact({ product_id: "low", rating: 2 }),
      fact({ product_id: "high", rating: 5 }),
      fact({ product_id: "mid", rating: 3 }),
    ];

    it("puts the best-rated first by default, which is the whole point of the board", async () => {
      const data = await aggregate(three);
      expect(data.map((d) => d.product_id)).toEqual(["high", "mid", "low"]);
    });

    it("reverses on ascending", async () => {
      const data = await aggregate(three, "avg_rating", "asc");
      expect(data.map((d) => d.product_id)).toEqual(["low", "mid", "high"]);
    });

    it("sorts by how many people rated it", async () => {
      const data = await aggregate(
        [fact({ product_id: "once" }), fact({ product_id: "twice" }), fact({ product_id: "twice" })],
        "count",
        "desc",
      );
      expect(data[0].product_id).toBe("twice");
    });

    it("sorts by name alphabetically rather than by code unit", async () => {
      const data = await aggregate(
        [fact({ product_id: "p1", brand_name: "Zonnatura" }), fact({ product_id: "p2", brand_name: "alpro" })],
        "brand_name",
        "asc",
      );
      // localeCompare, so a lower-case "alpro" still sorts before "Zonnatura".
      expect(data[0].brand_name).toBe("alpro");
    });

    it("leaves the order alone for a column it does not know", async () => {
      const data = await aggregate(three, "nonsense");
      expect(data).toHaveLength(3);
    });
  });
});
