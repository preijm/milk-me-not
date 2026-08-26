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

/**
 * The two greens the brand uses as *text*, and why there are two.
 *
 * --story-green is the fill and is 2.35:1 on cream, so it cannot be read at any
 * size. --story-green-dark clears AA but at 22% lightness stops looking like
 * this project's green, which is fair comment on a 78px headline. So display
 * type gets its own: the lightest, most vivid green in the same hue that still
 * clears the 3:1 large text is allowed.
 */
describe("the greens that carry words", () => {
  const CREAM = "#f5faf6";
  const AA_LARGE = 3;
  const AA_TEXT = 4.5;

  it("keeps the display green vivid but over the line for large type", () => {
    expect(contrast("#009e52", CREAM)).toBeGreaterThanOrEqual(AA_LARGE);
    // …and honest about not being safe for body copy, which is the whole
    // reason it is named for display rather than numbered.
    expect(contrast("#009e52", CREAM)).toBeLessThan(AA_TEXT);
  });

  it("keeps it lighter than the one small text has to use", () => {
    // If these ever converge, the accent word has gone dull again.
    expect(luminance("#009e52")).toBeGreaterThan(luminance("#007038"));
  });

  it("still refuses the fill green at any size", () => {
    expect(contrast("#00bd61", CREAM)).toBeLessThan(AA_LARGE);
  });

  it("puts barista on a tint, not a solid pill", () => {
    // Solid espresso was a 9.37:1 step from the white card it sits on and read
    // as the loudest thing in the row; the tint is a hair over the neutral
    // chip, and the text on it is far clear of AA.
    const chip = "#ede0d4", ink = "#63391d", card = "#ffffff", neutralChip = "#f2f2f2";
    expect(contrast(ink, chip)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(chip, card)).toBeLessThan(1.6);
    expect(contrast(chip, card)).toBeGreaterThan(contrast(neutralChip, card));
  });
});
