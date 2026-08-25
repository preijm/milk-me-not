import { describe, it, expect } from "vitest";
import { SCORE_TIERS, PRICE_QUALITY_TIERS, NO_SCORE_TIER } from "./tiers";

/**
 * The tiers name a score in words and colour, and for a long time those words
 * could not be read: `color` runs 2.26:1 (Fair) to 4.35:1 (Waste) on white and
 * 2.02:1 to 3.69:1 on its own `light` tint. `ink` is the same hue taken down to
 * where it can be.
 *
 * This is arithmetic, not rendering, so it holds whatever the components do
 * with the values — and it fails the moment someone reaches for `color` as a
 * text colour again by editing these numbers.
 */

const srgb = (hex: string) =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

const luminance = (hex: string) => {
  const [r, g, b] = srgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const WHITE = "#ffffff";
const CREAM = "#f5faf6"; // --story-cream, the page's own ground
const AA_TEXT = 4.5;

describe("tier colours", () => {
  const all = [...SCORE_TIERS, NO_SCORE_TIER];

  it.each(all)("$name reads on white, cream and its own tint", (tier) => {
    expect(contrast(tier.ink, WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(tier.ink, CREAM)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(tier.ink, tier.light)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(PRICE_QUALITY_TIERS)("$label reads on its own tint", (tier) => {
    expect(contrast(tier.ink, WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(tier.ink, tier.light)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("catches a tier that goes back to being unreadable", () => {
    // Proof this test can fail: the old values, checked the same way.
    const before = { color: "#dba32a", light: "#fbf2d3" };
    expect(contrast(before.color, WHITE)).toBeLessThan(AA_TEXT);
    expect(contrast(before.color, before.light)).toBeLessThan(AA_TEXT);
  });

  it("keeps a white label legible on a bar filled with ink", () => {
    // The FAQ scale paints its bars in `ink` precisely so the range and the
    // tier name can sit on them. Neither ink nor white cleared 4.5:1 on the
    // vivid `color`.
    for (const tier of SCORE_TIERS) {
      expect(contrast(WHITE, tier.ink)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it("still keeps the vivid value, because charts are not text", () => {
    // If these ever collapse into one field the graphics lose their punch.
    for (const tier of SCORE_TIERS) expect(tier.color).not.toBe(tier.ink);
  });
});
