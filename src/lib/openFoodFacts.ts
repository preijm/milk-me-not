/**
 * Look a barcode up in Open Food Facts.
 *
 * Scanning exists to save someone typing a brand and a product name for a
 * carton the board has never seen. Open Food Facts is an open database with
 * good European coverage of plant milks, needs no key, and returns exactly
 * those two fields — so a scan can fill in the form rather than replace it.
 *
 * Coverage is not total. Every failure path here returns null and leaves the
 * reader typing, which is what they would have been doing anyway.
 */

const ENDPOINT = "https://world.openfoodfacts.org/api/v2/product";
const FIELDS = "product_name,product_name_en,brands,categories_tags,labels_tags,quantity";

/** Categories that mean "this is a plant milk", used to warn on a mismatch. */
const PLANT_MILK_HINTS = [
  "plant-based-milk-alternatives",
  "plant-based-beverages",
  "oat-based-drinks",
  "soy-milk",
  "almond-milks",
  "cereal-based-drinks",
  "nut-milks",
];

export type ScannedProduct = {
  barcode: string;
  /** Title-cased, first brand only — OFF returns "alpro" or "Alpro, Danone". */
  brand: string | null;
  name: string | null;
  quantity: string | null;
  /** False when the categories suggest this is not a plant milk at all. */
  looksLikePlantMilk: boolean;
  /** OFF often tags barista editions explicitly. */
  isBarista: boolean;
  /**
   * Category and label tags, language prefix stripped.
   *
   * Kept rather than reduced to the two booleans below, because they are the
   * only part of this answer that speaks the board's vocabulary: the board
   * names a product by its milk base — "Oat", "Soya" — and OFF states that as
   * `oat-based-drinks`, where `product_name` says "OAT-LY! iKAFFE BARISTA
   * EDITION". See `scanSuggestions.ts`.
   */
  tags: string[];
};

/**
 * Tidy a brand's casing, but only where OFF gave us none to keep.
 *
 * The board's brand list is full of deliberate casing — `dmBio`, `enerBiO`,
 * `vly`, `vehappy`, `V-Love`, `BIO+` — and title-casing everything turned
 * those into "Dmbio", "Enerbio", "Vly" and "V-love". Existing brands survived
 * that only because the lookup is case-insensitive and the board's own
 * spelling then wins; a brand the board has never seen would have been created
 * under the invented one.
 *
 * So a string that carries casing information is left exactly as it came, and
 * only one with none — all lower or all upper — is title-cased. "alpro"
 * becomes "Alpro" and "RUDE HEALTH" becomes "Rude Health", which is what this
 * was for.
 */
const titleCase = (s: string): string => {
  const hasUpper = /\p{Lu}/u.test(s);
  const hasLower = /\p{Ll}/u.test(s);
  if (hasUpper && hasLower) return s;

  // An all-lower-case brand with hyphens and no spaces is a slug rather than a
  // name — OFF returns "fair-trade-original" for Fair Trade Original. A
  // hyphenated name that carries casing never reaches here.
  const words = hasUpper || !/-/.test(s) || /\s/.test(s) ? s : s.replace(/-+/g, " ");

  return words.replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
};

export const lookUpBarcode = async (
  barcode: string,
  signal?: AbortSignal,
): Promise<ScannedProduct | null> => {
  const code = barcode.trim();
  if (!/^\d{8,14}$/.test(code)) return null;

  let json: {
    status?: number;
    product?: {
      product_name?: string;
      product_name_en?: string;
      brands?: string;
      quantity?: string;
      categories_tags?: string[];
      labels_tags?: string[];
    };
  };

  try {
    const res = await fetch(`${ENDPOINT}/${code}.json?fields=${FIELDS}`, { signal });
    if (!res.ok) return null;
    json = await res.json();
  } catch {
    // Offline, blocked, or aborted — the form still works by hand.
    return null;
  }

  if (json.status !== 1 || !json.product) return null;
  const p = json.product;

  const brandRaw = (p.brands ?? "").split(",")[0]?.trim();
  const tags = [...(p.categories_tags ?? []), ...(p.labels_tags ?? [])].map((t) =>
    t.replace(/^[a-z]{2}:/, ""),
  );

  const name = (p.product_name_en || p.product_name || "").trim() || null;

  return {
    barcode: code,
    brand: brandRaw ? titleCase(brandRaw) : null,
    name,
    quantity: p.quantity?.trim() || null,
    tags,
    looksLikePlantMilk: tags.some((t) => PLANT_MILK_HINTS.includes(t)),
    // Barista editions are usually only stated in the product name — Oatly's
    // "OAT-LY! iKAFFE BARISTA EDITION" carries no barista tag at all.
    isBarista: tags.some((t) => t.includes("barista")) || /barista/i.test(name ?? ""),
  };
};
