import { describe, it, expect, vi, beforeEach } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));

import { fetchRatingFacts } from "./useRatingFacts";

const row = (over: Record<string, unknown> = {}) => ({
  product_id: "p1",
  brand_name: "Alpro",
  product_name: "Oat",
  rating: 8,
  is_barista: false,
  price_quality_ratio: null,
  property_names: null,
  flavor_names: null,
  created_at: "2026-08-01T00:00:00+00:00",
  country_code: "NL",
  ...over,
});

beforeEach(() => rpc.mockReset());

/**
 * The RPC anonymises a rating's timestamp by zeroing it, so "no date" arrives
 * as the epoch rather than as null. Taken literally it makes seven ratings in
 * ten look older than the site, and the brand index printed "Jan 1970".
 */
describe("the anonymised timestamp", () => {
  it("reads the epoch as no date at all", async () => {
    rpc.mockResolvedValue({
      data: [row({ created_at: "1970-01-01T00:00:00+00:00" })],
      error: null,
    });
    expect((await fetchRatingFacts())[0].created_at).toBeNull();
  });

  it("keeps a real date exactly as given", async () => {
    rpc.mockResolvedValue({ data: [row()], error: null });
    expect((await fetchRatingFacts())[0].created_at).toBe("2026-08-01T00:00:00+00:00");
  });

  it("still copes with an actually missing date", async () => {
    rpc.mockResolvedValue({ data: [row({ created_at: null })], error: null });
    expect((await fetchRatingFacts())[0].created_at).toBeNull();
  });

  it("drops rows with no usable rating rather than scoring them zero", async () => {
    rpc.mockResolvedValue({
      data: [row(), row({ rating: null }), row({ rating: Number.NaN })],
      error: null,
    });
    expect(await fetchRatingFacts()).toHaveLength(1);
  });

  it("throws when the RPC does, rather than returning an empty board", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("nope") });
    await expect(fetchRatingFacts()).rejects.toThrow();
  });
});
