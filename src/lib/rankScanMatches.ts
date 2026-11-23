import type { ScannedProduct } from "./openFoodFacts";
import { suggestFromScan } from "./scanSuggestions";

/** The part of a `search_product_types` row that ranking reads. */
export type RankableMatch = {
  product_name: string;
  is_barista: boolean;
  /** Property keys, as `product_search_view` aggregates them. */
  property_names: string[] | null;
  /** Flavour keys, as `product_search_view` aggregates them. */
  flavor_names: string[] | null;
};

/** A board name as a set of bases: "Oat, Almond" and "Almond, Oat" are one name. */
const baseSet = (name: string): string =>
  name
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");

/**
 * Put the carton most likely to be in the reader's hand first.
 *
 * A brand search is wide by design: an Alpro scan returns 27 rows and the
 * dialog shows 8. They used to be ordered by barista alone, so a plain Alpro
 * Soya could sit ninth behind five Soya flavours and three Oats, and a reader
 * who did not find it in the eight either gave up or picked the nearest one —
 * which is then written against the barcode for everyone after.
 *
 * The scan already says more than barista. `suggestFromScan` reads the base,
 * flavours and properties out of Open Food Facts' tags, in the board's own
 * keys, and every row carries the same keys. So each row is scored on how
 * well it agrees:
 *
 * - **Base** carries the most weight, because it is what the board names a
 *   product by. The whole set matching ("Oat, Almond" for an oat-and-almond
 *   carton) beats sharing one base with it.
 * - **Barista** agreeing either way. A plain carton should prefer the plain
 *   row, not merely stop preferring the barista one.
 * - **Flavours** count against as well as for. A flavour on the row that the
 *   carton never mentioned is the strongest sign it is a different carton —
 *   it is what separates plain Soya from Soya Banana — while a flavour the
 *   carton states and the row lacks is weaker evidence, since rows are
 *   sometimes registered without theirs.
 * - **Properties** on the row work like flavours at half the weight. Some are
 *   product lines as distinct as a flavour — Soya Protein, Soya Light — and a
 *   plain scan should not tie with them. Others are tagged unreliably (a bio
 *   carton is often not tagged bio), so an unstated one costs less than an
 *   unstated flavour, and a property the scan states but the row lacks costs
 *   nothing at all.
 *
 * Ties keep the order the search returned them in, so a scan that says
 * nothing useful leaves the list exactly as it was.
 */
export const scoreScanMatch = (
  scanned: Pick<ScannedProduct, "tags" | "name" | "brand" | "isBarista">,
  row: RankableMatch,
): number => {
  const suggestion = suggestFromScan(scanned);
  return scoreAgainst(suggestion, scanned.isBarista, row);
};

const scoreAgainst = (
  suggestion: ReturnType<typeof suggestFromScan>,
  isBarista: boolean,
  row: RankableMatch,
): number => {
  let score = 0;

  if (suggestion.bases.length > 0) {
    const rowBases = baseSet(row.product_name);
    if (rowBases === baseSet(suggestion.bases.join(","))) {
      score += 8;
    } else {
      const parts = new Set(rowBases.split("|"));
      if (suggestion.bases.some((b) => parts.has(b.toLowerCase()))) score += 4;
    }
  }

  if (row.is_barista === isBarista) score += 2;

  const wantedFlavors = new Set(suggestion.flavors);
  const rowFlavors = row.flavor_names ?? [];
  for (const flavor of rowFlavors) score += wantedFlavors.has(flavor) ? 2 : -2;
  for (const flavor of wantedFlavors) if (!rowFlavors.includes(flavor)) score -= 1;

  const wantedProperties = new Set(suggestion.properties);
  for (const property of row.property_names ?? []) score += wantedProperties.has(property) ? 1 : -1;

  return score;
};

export const rankScanMatches = <T extends RankableMatch>(
  scanned: Pick<ScannedProduct, "tags" | "name" | "brand" | "isBarista">,
  rows: T[],
): T[] => {
  // Read the carton once, not once per row.
  const suggestion = suggestFromScan(scanned);
  return rows
    .map((row, index) => ({ row, index, score: scoreAgainst(suggestion, scanned.isBarista, row) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ row }) => row);
};
