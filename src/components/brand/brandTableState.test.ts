import { describe, it, expect } from "vitest";
import { sortBrands, filterBrands, firstDirectionFor, isFiltered, NO_FILTER } from "./brandTableState";
import type { BrandSummary } from "./brandSummary";

const row = (over: Partial<BrandSummary> & { brand: string }): BrandSummary => ({
  n: 1,
  products: 1,
  avg: 7,
  min: 7,
  max: 7,
  latest: "2026-01-01T00:00:00Z",
  ...over,
});

const ROWS: BrandSummary[] = [
  row({ brand: "Alpro", n: 49, avg: 7.4, latest: "2026-08-01T00:00:00Z" }),
  row({ brand: "Vemondo", n: 7, avg: 8.0, latest: "2026-02-01T00:00:00Z" }),
  row({ brand: "Wunda", n: 4, avg: 6.5, latest: "2025-03-01T00:00:00Z" }),
  row({ brand: "Harvest Moon", n: 2, avg: 9.5, latest: null }),
];

describe("sorting the brand table", () => {
  it("leads with the most rated by default", () => {
    expect(sortBrands(ROWS, { key: "ratings", direction: "desc" })[0].brand).toBe("Alpro");
  });

  it("leads with the best scoring when asked, however thin the evidence", () => {
    expect(sortBrands(ROWS, { key: "score", direction: "desc" })[0].brand).toBe("Harvest Moon");
  });

  it("sorts a brand with no dated rating as the oldest, not the newest", () => {
    const recent = sortBrands(ROWS, { key: "recent", direction: "desc" });
    expect(recent[0].brand).toBe("Alpro");
    // The trap: "" compares high in a descending sort and would put an
    // undated brand at the top as though it were the freshest thing here.
    expect(recent.at(-1)?.brand).toBe("Harvest Moon");
  });

  it("sorts by name in both directions", () => {
    expect(sortBrands(ROWS, { key: "name", direction: "asc" })[0].brand).toBe("Alpro");
    expect(sortBrands(ROWS, { key: "name", direction: "desc" })[0].brand).toBe("Wunda");
  });

  it("breaks every tie on the name, so the order never wobbles", () => {
    const tied = [row({ brand: "Zebra", n: 5, avg: 7 }), row({ brand: "Aardvark", n: 5, avg: 7 })];
    expect(sortBrands(tied, { key: "ratings", direction: "desc" }).map((r) => r.brand)).toEqual([
      "Aardvark",
      "Zebra",
    ]);
  });

  it("does not mutate what it was given", () => {
    const before = ROWS.map((r) => r.brand);
    sortBrands(ROWS, { key: "name", direction: "asc" });
    expect(ROWS.map((r) => r.brand)).toEqual(before);
  });

  it("starts numbers high and names low", () => {
    expect(firstDirectionFor("ratings")).toBe("desc");
    expect(firstDirectionFor("score")).toBe("desc");
    expect(firstDirectionFor("recent")).toBe("desc");
    expect(firstDirectionFor("name")).toBe("asc");
  });
});

describe("filtering the brand table", () => {
  it("keeps everything by default", () => {
    expect(filterBrands(ROWS, NO_FILTER)).toHaveLength(4);
    expect(isFiltered(NO_FILTER)).toBe(false);
  });

  it("narrows to one kind of company", () => {
    const ownLabel = filterBrands(ROWS, { kind: "own-label", goneOnly: false });
    expect(ownLabel.map((r) => r.brand)).toEqual(["Vemondo"]);
  });

  it("drops brands we hold no owner for when a kind is chosen", () => {
    const groups = filterBrands(ROWS, { kind: "group", goneOnly: false });
    expect(groups.map((r) => r.brand)).toEqual(["Alpro", "Wunda"]);
    expect(groups.some((r) => r.brand === "Harvest Moon")).toBe(false);
  });

  it("narrows to the brands known to have stopped", () => {
    expect(filterBrands(ROWS, { kind: null, goneOnly: true }).map((r) => r.brand)).toEqual(["Wunda"]);
  });

  it("combines the two", () => {
    expect(filterBrands(ROWS, { kind: "own-label", goneOnly: true })).toHaveLength(0);
    expect(isFiltered({ kind: "own-label", goneOnly: true })).toBe(true);
  });
});
