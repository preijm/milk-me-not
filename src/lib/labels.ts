/**
 * Turning database keys into words a reader would use.
 *
 * Product properties and flavours come out of Supabase as raw keys
 * (`no_sugar`, `HIGH-PROTEIN`, `barista blend`). Anywhere the public site shows
 * one, it goes through here first — a shopper should never be shown a column
 * value.
 */

/** Words that keep their conventional casing rather than being title-cased. */
const KEEP_UPPER = new Set(["uht", "bio", "eu", "usda"]);

/** Multi-word keys whose natural phrasing is not just a de-underscored key. */
const OVERRIDES: Record<string, string> = {
  no_sugar: "No added sugar",
  nosugar: "No added sugar",
  no_added_sugar: "No added sugar",
  unsweetened: "Unsweetened",
  high_protein: "High protein",
  is_barista: "Barista",
  barista: "Barista",
  bio: "Organic",
  organic: "Organic",
  gluten_free: "Gluten free",
  lactose_free: "Lactose free",
  low_sugar: "Low sugar",
  calcium: "Added calcium",
};

/**
 * `no_sugar` → `No added sugar`, `red-fruits` → `Red fruits`.
 * Returns an empty string for empty input so callers can filter on falsiness.
 */
export const humanizeLabel = (raw: string | null | undefined): string => {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const key = trimmed.toLowerCase().replace(/[\s-]+/g, "_");
  if (OVERRIDES[key]) return OVERRIDES[key];

  const words = trimmed
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (KEEP_UPPER.has(lower)) return word.toUpperCase();
      // Leave deliberate inner capitals alone (e.g. "McDonald's", "iMilk").
      if (/[a-z][A-Z]/.test(word)) return word;
      const cased = lower.charAt(0).toUpperCase() + lower.slice(1);
      return i === 0 ? cased : lower;
    })
    .join(" ");
};

/** Humanize a list of keys, dropping blanks and duplicates, preserving order. */
export const humanizeLabels = (raw: (string | null | undefined)[] | null | undefined): string[] => {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const label = humanizeLabel(item);
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    out.push(label);
  }
  return out;
};
