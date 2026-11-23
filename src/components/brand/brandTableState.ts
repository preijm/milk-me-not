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

export const DEFAULT_SORT: BrandSort = { key: "ratings", direction: "desc" };

const SORT_KEYS: readonly string[] = ["ratings", "score", "recent", "name"];
const OWNER_KINDS: readonly string[] = ["own-label", "group", "independent"];

const isSortKey = (value: string | null): value is BrandSortKey => value !== null && SORT_KEYS.includes(value);

const isOwnerKind = (value: string | null): value is BrandOwnerKind =>
  value !== null && OWNER_KINDS.includes(value);

/**
 * Reads the table's state out of the query string, which is where it lives.
 *
 * Anything missing or unrecognised falls back to the default rather than
 * rendering an empty table. This string is public: it gets hand-edited,
 * truncated by chat clients and pasted half-copied, and none of that should be
 * able to produce a page that looks broken.
 */
export const readBrandTableState = (params: URLSearchParams): { filter: BrandFilter; sort: BrandSort } => {
  const column = params.get("sortColumn");
  const direction = params.get("sortDir");
  const kind = params.get("kind");

  return {
    filter: {
      kind: isOwnerKind(kind) ? kind : null,
      goneOnly: params.get("gone") === "true",
    },
    // A direction on its own has no column to apply to, so it is the column
    // that decides whether there is a sort here at all. A column with no
    // direction is read the way that column is usually read, so a hand-typed
    // `?sortColumn=name` gives A–Z.
    sort: isSortKey(column)
      ? {
          key: column,
          direction: direction === "asc" || direction === "desc" ? direction : firstDirectionFor(column),
        }
      : DEFAULT_SORT,
  };
};

/**
 * What a given state should be written as.
 *
 * Defaults are omitted, so an untouched page keeps a clean `/brands` and only
 * a deliberate choice shows up in the address bar.
 */
export const brandTableQuery = (filter: BrandFilter, sort: BrandSort): Record<string, string> => {
  const query: Record<string, string> = {};

  if (filter.kind) query.kind = filter.kind;
  if (filter.goneOnly) query.gone = "true";

  if (sort.key !== DEFAULT_SORT.key || sort.direction !== DEFAULT_SORT.direction) {
    // Both or neither. A lone direction has no column to apply to, and a lone
    // column would quietly take its natural direction on the way back in.
    query.sortColumn = sort.key;
    query.sortDir = sort.direction;
  }

  return query;
};
