/**
 * Sorting and filtering for the brand index, kept as pure functions so the
 * ordering can be tested without a renderer.
 */
import { brandFacts, brandState, type BrandOwnerKind } from "@/lib/brandFacts";
import type { BrandSummary } from "./brandSummary";

export type BrandSortKey = "ratings" | "score" | "recent" | "name";

/**
 * Which way round each column starts.
 *
 * Numbers descend first, because "most rated" and "best scoring" are the
 * questions people arrive with; a name ascends, because a Z-first alphabet is
 * nobody's first choice.
 */
const FIRST_DIRECTION: Record<BrandSortKey, "asc" | "desc"> = {
  ratings: "desc",
  score: "desc",
  recent: "desc",
  name: "asc",
};

export const firstDirectionFor = (key: BrandSortKey) => FIRST_DIRECTION[key];

export type BrandSort = { key: BrandSortKey; direction: "asc" | "desc" };

export type BrandFilter = {
  /** `null` is "any kind", which includes brands we hold no owner for. */
  kind: BrandOwnerKind | null;
  /** Narrow to the brands known to have stopped. */
  goneOnly: boolean;
};

export const NO_FILTER: BrandFilter = { kind: null, goneOnly: false };

export const isFiltered = (filter: BrandFilter) => filter.kind !== null || filter.goneOnly;

const compare = (a: BrandSummary, b: BrandSummary, key: BrandSortKey): number => {
  switch (key) {
    case "ratings":
      // Ties on the average, so the better-evidenced of two equal counts wins.
      return a.n - b.n || a.avg - b.avg;
    case "score":
      return a.avg - b.avg || a.n - b.n;
    case "recent":
      // A brand with no dated rating sorts as the oldest thing there is,
      // rather than jumping to the top of a descending list as "" would.
      return (a.latest ?? "").localeCompare(b.latest ?? "") || a.n - b.n;
    case "name":
      return a.brand.localeCompare(b.brand);
  }
};

export const sortBrands = (rows: BrandSummary[], sort: BrandSort): BrandSummary[] =>
  [...rows].sort((a, b) => {
    const by = compare(a, b, sort.key);
    // Name breaks every remaining tie, so the order never depends on which
    // rating happened to arrive first.
    return (sort.direction === "asc" ? by : -by) || a.brand.localeCompare(b.brand);
  });

export const filterBrands = (rows: BrandSummary[], filter: BrandFilter): BrandSummary[] =>
  rows.filter((row) => {
    if (filter.goneOnly && brandState(row.brand) !== "discontinued") return false;
    if (filter.kind && brandFacts(row.brand)?.owner?.kind !== filter.kind) return false;
    return true;
  });
