import { describe, it, expect, vi, afterEach } from "vitest";
import { lookUpBarcode } from "./openFoodFacts";

/**
 * Brand casing, checked against the board's own list.
 *
 * These are the real spellings in `brands`. The board keeps deliberate casing,
 * and a brand it has never seen is created from whatever arrives here — so
 * inventing a spelling at this point is how a second, differently-cased
 * "dmBio" would get onto the board.
 */
const offReturns = (brands: string) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: 1,
          product: { brands, product_name: "Drink", categories_tags: [], labels_tags: [] },
        }),
      ),
    ),
  );
};

const brandOf = async () => (await lookUpBarcode("8712800147008"))?.brand;

describe("brand casing", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("title-cases a brand that arrives with no casing to keep", async () => {
    offReturns("alpro");
    expect(await brandOf()).toBe("Alpro");
  });

  it("title-cases a shouted brand", async () => {
    offReturns("RUDE HEALTH");
    expect(await brandOf()).toBe("Rude Health");
  });

  it.each(["dmBio", "enerBiO", "V-Love", "Oatly!", "AH Terra", "Arla Jörd"])(
    "leaves %s exactly as the board spells it",
    async (brand) => {
      offReturns(brand);
      expect(await brandOf()).toBe(brand);
    },
  );

  it("keeps an all-lower-case brand lower-case only when the board has none other", async () => {
    // "vly" and "vehappy" are on the board in lower case, but OFF gives no
    // casing signal here at all, so this is title-cased and the lookup — which
    // is case-insensitive — still finds them. What matters is that it does not
    // silently create a second one.
    offReturns("vly");
    expect((await brandOf())?.toLowerCase()).toBe("vly");
  });

  it("reads a hyphenated slug as words", async () => {
    offReturns("fair-trade-original");
    expect(await brandOf()).toBe("Fair Trade Original");
  });

  it("takes the first brand only", async () => {
    offReturns("Alpro, Danone");
    expect(await brandOf()).toBe("Alpro");
  });
});
