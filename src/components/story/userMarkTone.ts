/**
 * The colour a person's mark wears, derived from their name.
 *
 * Kept out of the component file so fast refresh keeps working — the same
 * reason memberNav.ts exists. See the react-refresh/only-export-components rule.
 */

/**
 * Pale ground, deep ink of the same hue, so a row of these reads as one family
 * rather than a bag of highlighter pens. Ordered so neighbouring hashes land on
 * clearly different hues rather than on two neighbouring greens.
 */
export const MARK_TONES = [
  { bg: "bg-story-green-light", fg: "text-story-green-dark" },
  { bg: "bg-story-blue-light", fg: "text-story-blue-dark" },
  { bg: "bg-story-amber-light", fg: "text-story-amber-dark" },
  { bg: "bg-story-tint-mint", fg: "text-story-green-dark" },
  { bg: "bg-story-tint-clay", fg: "text-story-amber-dark" },
  { bg: "bg-story-tint-sky", fg: "text-story-blue-dark" },
] as const;

/**
 * djb2. Any stable hash would do; what matters is that it depends only on the
 * name — not on render order, not on anything that changes between sessions —
 * so the same person is the same colour on the feed, in their notifications
 * and on their profile, with no column in the database and nothing to pick.
 */
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const markFor = (name: string | null | undefined) =>
  MARK_TONES[hash((name ?? "").trim().toLowerCase()) % MARK_TONES.length];
