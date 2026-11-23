import { describe, it, expect } from "vitest";
import { rankScanMatches, scoreScanMatch, type RankableMatch } from "./rankScanMatches";

const scan = (
  tags: string[],
  name: string | null = null,
  { brand = "Alpro", isBarista = false }: { brand?: string | null; isBarista?: boolean } = {},
) => ({ tags, name, brand, isBarista });

const row = (
  id: string,
  product_name: string,
  { barista = false, flavors = null, properties = null }: {
    barista?: boolean;
    flavors?: string[] | null;
    properties?: string[] | null;
  } = {},
): RankableMatch & { id: string } => ({
  id,
  product_name,
  is_barista: barista,
  flavor_names: flavors,
  property_names: properties,
});

const ids = (rows: Array<{ id: string }>) => rows.map((r) => r.id);

/**
 * Roughly what an Alpro brand search returns, in the order the search gives
 * it: oat first, then a run of soya flavours, with the plain soya last.
 */
const ALPRO = [
  row("oat", "Oat"),
  row("oat-barista", "Oat", { barista: true }),
  row("soya-banana", "Soya", { flavors: ["banana"] }),
  row("soya-red-fruits", "Soya", { flavors: ["red_fruits"] }),
  row("soya-protein-choc", "Soya", { flavors: ["chocolate"], properties: ["protein"] }),
  row("soya-protein", "Soya", { properties: ["protein"] }),
  row("soya-light", "Soya", { properties: ["light"] }),
  row("almond", "Almond"),
  row("soya", "Soya"),
];

describe("rankScanMatches", () => {
  it("puts the plain carton first when the scan names no flavour", () => {
    // The case this exists for: plain soya was ninth and the dialog shows eight.
    const ranked = rankScanMatches(scan(["soy-based-drinks"], "Soya Original"), ALPRO);
    expect(ranked[0].id).toBe("soya");
    // Every soya outranks every non-soya.
    const firstOther = ranked.findIndex((r) => r.product_name !== "Soya");
    expect(ranked.slice(firstOther).every((r) => r.product_name !== "Soya")).toBe(true);
  });

  it("puts the flavoured carton first when the scan names that flavour", () => {
    const ranked = rankScanMatches(scan(["soy-based-drinks"], "Soya Banana"), ALPRO);
    expect(ranked[0].id).toBe("soya-banana");
  });

  it("uses a stated property to choose between cartons with the same base", () => {
    const ranked = rankScanMatches(scan(["soy-based-drinks", "high-protein"], "Soya Protein"), ALPRO);
    expect(ranked[0].id).toBe("soya-protein");
  });

  it("prefers the plain row for a plain scan, not just the barista row for a barista scan", () => {
    expect(ids(rankScanMatches(scan(["oat-based-drinks"]), ALPRO)).slice(0, 2)).toEqual([
      "oat",
      "oat-barista",
    ]);
    expect(
      ids(rankScanMatches(scan(["oat-based-drinks"], null, { isBarista: true }), ALPRO)).slice(0, 2),
    ).toEqual(["oat-barista", "oat"]);
  });

  it("ranks a whole-set name above a row that shares one base", () => {
    const rows = [row("oat", "Oat"), row("almond", "Almond"), row("oat-almond", "Almond, Oat")];
    const ranked = rankScanMatches(scan(["oat-based-drinks", "almond-based-drinks"]), rows);
    expect(ranked[0].id).toBe("oat-almond");
  });

  it("leaves the order alone when the scan says nothing it can use", () => {
    // No base, no flavour, no property, not barista: every non-barista row
    // ties, every barista row ties lower, and ties keep the search's order.
    const rows = [row("a", "Oat"), row("b", "Soya"), row("c", "Almond")];
    expect(ids(rankScanMatches(scan([], null), rows))).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the rows it was given", () => {
    const rows = [...ALPRO];
    rankScanMatches(scan(["soy-based-drinks"]), rows);
    expect(rows).toEqual(ALPRO);
  });
});

describe("scoreScanMatch", () => {
  it("scores a flavour the carton never mentioned below no flavour at all", () => {
    const s = scan(["soy-based-drinks"]);
    expect(scoreScanMatch(s, row("x", "Soya"))).toBeGreaterThan(
      scoreScanMatch(s, row("y", "Soya", { flavors: ["banana"] })),
    );
  });

  it("treats a row with no badges as having none, not as an error", () => {
    expect(() =>
      scoreScanMatch(scan(["soy-based-drinks"]), row("x", "Soya", { flavors: null, properties: null })),
    ).not.toThrow();
  });
});
