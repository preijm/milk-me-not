import { describe, it, expect } from "vitest";
import {
  sortBrands,
  filterBrands,
  firstDirectionFor,
  isFiltered,
  brandTableQuery,
  readBrandTableState,
  DEFAULT_SORT,
  NO_FILTER,
  type BrandFilter,
  type BrandSort,
} from "./brandTableState";
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

describe("the brand table's state in the query string", () => {
  const read = (query: string) => readBrandTableState(new URLSearchParams(query));

  it("writes nothing at all for the default view", () => {
    expect(brandTableQuery(NO_FILTER, DEFAULT_SORT)).toEqual({});
  });

  it("reads the default view out of an empty query", () => {
    expect(read("")).toEqual({ filter: NO_FILTER, sort: DEFAULT_SORT });
  });

  it("survives a round trip through the query string", () => {
    const filters: BrandFilter[] = [
      NO_FILTER,
      { kind: "own-label", goneOnly: false },
      { kind: "group", goneOnly: true },
      { kind: "independent", goneOnly: false },
      { kind: null, goneOnly: true },
    ];
    const sorts: BrandSort[] = (["ratings", "score", "recent", "name"] as const).flatMap((key) => [
      { key, direction: "asc" as const },
      { key, direction: "desc" as const },
    ]);

    for (const filter of filters) {
      for (const sort of sorts) {
        const query = new URLSearchParams(brandTableQuery(filter, sort));
        expect(readBrandTableState(query), query.toString() || "(empty)").toEqual({ filter, sort });
      }
    }
  });

  it("writes a filtered, sorted view as the params we promised", () => {
    expect(brandTableQuery({ kind: "own-label", goneOnly: true }, { key: "name", direction: "asc" })).toEqual({
      kind: "own-label",
      gone: "true",
      sortColumn: "name",
      sortDir: "asc",
    });
  });

  // Everything below is a URL nothing here writes: hand-edited, half-pasted or
  // truncated by a chat client. None of them may produce an empty table.
  it("ignores a kind it does not recognise", () => {
    expect(read("kind=conglomerate").filter).toEqual(NO_FILTER);
  });

  it("treats anything but gone=true as not filtering", () => {
    expect(read("gone=1").filter.goneOnly).toBe(false);
    expect(read("gone=yes").filter.goneOnly).toBe(false);
    expect(read("gone=true").filter.goneOnly).toBe(true);
  });

  it("falls back to the default sort for a column it does not recognise", () => {
    expect(read("sortColumn=price&sortDir=asc").sort).toEqual(DEFAULT_SORT);
  });

  it("gives a column named without a direction the direction it is usually read in", () => {
    expect(read("sortColumn=name").sort).toEqual({ key: "name", direction: "asc" });
    expect(read("sortColumn=score").sort).toEqual({ key: "score", direction: "desc" });
  });

  it("ignores a direction with no column to apply it to", () => {
    expect(read("sortDir=asc").sort).toEqual(DEFAULT_SORT);
  });

  it("ignores a direction that is not a direction", () => {
    expect(read("sortColumn=name&sortDir=sideways").sort).toEqual({ key: "name", direction: "asc" });
  });

  it("keeps the sort when the filters are cleared", () => {
    const sort: BrandSort = { key: "recent", direction: "desc" };
    expect(brandTableQuery(NO_FILTER, sort)).toEqual({ sortColumn: "recent", sortDir: "desc" });
  });
});
