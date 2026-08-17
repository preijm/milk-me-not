/**
 * Working out which plant a product is made from.
 *
 * The catalogue has no base column — it lives in the product name, and
 * occasionally in the property list. Inferring it is what lets the site slice
 * the shelf by plant and give a long ranked list some row-to-row variety
 * without inventing data.
 */

export type PlantBase = {
  key: string;
  label: string;
  /** Three letters, set in the display face, standing in for an icon. */
  abbr: string;
  /** Chip ground + text, so a list of 200 rows is not one flat colour. */
  bg: string;
  fg: string;
};

export const PLANT_BASES: PlantBase[] = [
  { key: "oat", label: "Oat", abbr: "OAT", bg: "bg-story-green-wash", fg: "text-story-green-dark" },
  { key: "almond", label: "Almond", abbr: "ALM", bg: "bg-story-blue-light", fg: "text-story-blue-dark" },
  { key: "soy", label: "Soy", abbr: "SOY", bg: "bg-story-amber-light", fg: "text-story-amber-dark" },
  { key: "coconut", label: "Coconut", abbr: "COC", bg: "bg-story-cream-2", fg: "text-story-ink-2" },
  { key: "rice", label: "Rice", abbr: "RIC", bg: "bg-story-green-light", fg: "text-story-green-dark" },
  { key: "hazelnut", label: "Hazelnut", abbr: "HAZ", bg: "bg-story-amber-light", fg: "text-story-amber-dark" },
  { key: "pea", label: "Pea", abbr: "PEA", bg: "bg-story-green-wash", fg: "text-story-green-dark" },
  { key: "cashew", label: "Cashew", abbr: "CAS", bg: "bg-story-blue-light", fg: "text-story-blue-dark" },
  { key: "walnut", label: "Walnut", abbr: "WAL", bg: "bg-story-cream-2", fg: "text-story-ink-2" },
  { key: "hemp", label: "Hemp", abbr: "HMP", bg: "bg-story-green-light", fg: "text-story-green-dark" },
  { key: "spelt", label: "Spelt", abbr: "SPT", bg: "bg-story-amber-light", fg: "text-story-amber-dark" },
];

const BLEND: PlantBase = {
  key: "blend",
  label: "Blend",
  abbr: "MIX",
  bg: "bg-story-cream-2",
  fg: "text-story-muted",
};

/** Longer names first so "hazelnut" never matches as "nut"-adjacent noise. */
const MATCH_ORDER = [...PLANT_BASES].sort((a, b) => b.key.length - a.key.length);

/**
 * Infer the plant base from any text that describes the product — usually
 * `"<brand> <product name>"`, optionally with its property list appended.
 * Falls back to a neutral "blend" mark rather than guessing.
 */
export const inferPlantBase = (text: string | null | undefined): PlantBase => {
  if (!text) return BLEND;
  const haystack = text.toLowerCase();
  // "Soya" is the common European spelling and would not match "soy" alone
  // in every form, so check it explicitly before the generic pass.
  if (haystack.includes("soya")) return PLANT_BASES.find((b) => b.key === "soy") ?? BLEND;
  return MATCH_ORDER.find((b) => haystack.includes(b.key)) ?? BLEND;
};
