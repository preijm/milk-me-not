import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { AggregatedResult } from "@/hooks/useAggregatedResults";

/**
 * What the results page shows, given a search box and a set of filters.
 *
 * This is the hook standing between 220 products and the handful a reader
 * asked for, and until now nothing tested it. The part most worth pinning is
 * the translation in the middle: filters arrive as database *keys*
 * (`no_sugar`), while an aggregated row carries display *names* ("No Sugar").
 * The hook looks the keys up in tables it fetches itself, and a mismatch there
 * does not throw or warn — it silently returns fewer products, or none.
 */

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));

/** What each table answers with. A promise that never settles means loading. */
const tables = vi.hoisted(() => ({
  properties: [] as unknown[],
  flavors: [] as unknown[],
  userTests: [] as unknown[],
  propertiesPending: false,
}));

vi.mock("@/integrations/supabase/client", () => {
  const answer = (table: string) => {
    if (table === "properties") {
      return tables.propertiesPending
        ? new Promise(() => {})
        : Promise.resolve({ data: tables.properties, error: null });
    }
    if (table === "flavors") return Promise.resolve({ data: tables.flavors, error: null });
    return Promise.resolve({ data: tables.userTests, error: null });
  };

  const builder = (table: string) => {
    const chain: Record<string, unknown> = {};
    for (const method of ["select", "order", "eq", "limit"]) {
      chain[method] = () => chain;
    }
    chain.then = (resolve: (v: unknown) => unknown) => answer(table).then(resolve);
    return chain;
  };

  return { supabase: { from: (table: string) => builder(table) } };
});

const { useResultsFiltering } = await import("./useResultsState");

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const product = (over: Partial<AggregatedResult> = {}): AggregatedResult => ({
  brand_id: "b1",
  brand_name: "Alpro",
  product_id: "p1",
  product_name: "Oat",
  property_names: null,
  flavor_names: null,
  is_barista: false,
  avg_rating: 4,
  count: 3,
  most_recent_date: "2026-08-01",
  ...over,
});

const NO_FILTERS = { barista: false, properties: [], flavors: [], myResultsOnly: false };

const filter = async (
  rows: AggregatedResult[],
  search = "",
  filters: Partial<typeof NO_FILTERS> = {},
) => {
  const { result } = renderHook(
    () => useResultsFiltering(rows, search, { ...NO_FILTERS, ...filters }),
    { wrapper },
  );
  // The lookup tables arrive asynchronously; settle before asserting.
  await waitFor(() => expect(result.current).toBeDefined());
  return result;
};

describe("useResultsFiltering", () => {
  beforeEach(() => {
    auth.user = null;
    tables.properties = [{ key: "no_sugar", name: "No Sugar" }, { key: "bio", name: "Bio" }];
    tables.flavors = [{ key: "vanilla", name: "Vanilla" }];
    tables.userTests = [];
    tables.propertiesPending = false;
  });

  describe("search", () => {
    it("matches on brand and on product", async () => {
      const rows = [product(), product({ product_id: "p2", brand_name: "Oatly!", product_name: "Soya" })];

      expect((await filter(rows, "alpro")).current.filteredResults).toHaveLength(1);
      expect((await filter(rows, "soya")).current.filteredResults).toHaveLength(1);
    });

    it("matches a property or flavour the reader can see on the row", async () => {
      const rows = [product({ property_names: ["No Sugar"], flavor_names: ["Vanilla"] })];

      expect((await filter(rows, "no sugar")).current.filteredResults).toHaveLength(1);
      expect((await filter(rows, "vanilla")).current.filteredResults).toHaveLength(1);
    });

    it("treats an underscore and a space as the same thing", async () => {
      // Names and keys disagree about this, and a reader types neither
      // consistently. Searching "no sugar" has to find "No_Sugar" and the
      // other way round.
      const rows = [product({ property_names: ["No_Sugar"] })];

      expect((await filter(rows, "no sugar")).current.filteredResults).toHaveLength(1);
      expect((await filter(rows, "no_sugar")).current.filteredResults).toHaveLength(1);
    });

    it("finds a barista carton by the word barista", async () => {
      const rows = [product({ is_barista: true }), product({ product_id: "p2" })];
      expect((await filter(rows, "barista")).current.filteredResults).toHaveLength(1);
    });

    it("keeps everything when the box is empty", async () => {
      const rows = [product(), product({ product_id: "p2" })];
      expect((await filter(rows)).current.filteredResults).toHaveLength(2);
    });
  });

  describe("filters", () => {
    it("translates a property key to the name the row carries", async () => {
      // The filter says `no_sugar`; the row says "No Sugar". Nothing in
      // between throws if this mapping breaks — the product simply vanishes.
      const rows = [
        product({ property_names: ["No Sugar"] }),
        product({ product_id: "p2", property_names: ["Bio"] }),
      ];

      const r = await filter(rows, "", { properties: ["no_sugar"] });
      await waitFor(() => expect(r.current.filteredResults).toHaveLength(1));
      expect(r.current.filteredResults[0].product_id).toBe("p1");
    });

    it("treats two properties as either, not both", async () => {
      const rows = [
        product({ property_names: ["No Sugar"] }),
        product({ product_id: "p2", property_names: ["Bio"] }),
      ];

      const r = await filter(rows, "", { properties: ["no_sugar", "bio"] });
      await waitFor(() => expect(r.current.filteredResults).toHaveLength(2));
    });

    it("keeps only barista cartons when asked", async () => {
      const rows = [product({ is_barista: true }), product({ product_id: "p2" })];
      const r = await filter(rows, "", { barista: true });
      await waitFor(() => expect(r.current.filteredResults).toHaveLength(1));
    });

    it("narrows to the reader's own products", async () => {
      auth.user = { id: "u1" };
      tables.userTests = [{ product_id: "p2" }];
      const rows = [product(), product({ product_id: "p2" })];

      const r = await filter(rows, "", { myResultsOnly: true });
      await waitFor(() => expect(r.current.filteredResults).toHaveLength(1));
      expect(r.current.filteredResults[0].product_id).toBe("p2");
    });

    it("drops a product when a known key matches nothing on it", async () => {
      const rows = [product({ property_names: ["Bio"] })];
      const r = await filter(rows, "", { properties: ["no_sugar"] });
      await waitFor(() => expect(r.current.filteredResults).toHaveLength(0));
    });
  });

  it("does not empty the board while the key-to-name tables are still loading", async () => {
    // Filters are parsed out of the URL on first mount, so a shared link like
    // /results?properties=bio arrives with the filter already on and the
    // lookup table not yet fetched. With no mapping available the filter can
    // match nothing, and matching nothing means hiding all 220 products —
    // the reader opens a shared link and sees an empty board.
    //
    // An unanswerable filter is not the same as a filter that excludes
    // everything, and this is the difference.
    tables.propertiesPending = true;
    const rows = [product({ property_names: ["Bio"] }), product({ product_id: "p2" })];

    const r = await filter(rows, "", { properties: ["bio"] });
    expect(r.current.filteredResults.length).toBeGreaterThan(0);
  });
});
