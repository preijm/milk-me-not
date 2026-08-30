import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { isFullBleedLogo } from "./brandLogo";

/**
 * A panel goes edge to edge with no white ground under it, so its own artwork
 * is the tile. Two things can go wrong there, both invisible in review:
 *
 * - **It does not reach the frame.** `contain` letterboxes whatever is left,
 *   and the row shows through. `friesche-vlag.svg` was 136x113 with the flag
 *   swoop along its bottom, so it rendered as a slab with cream above, below
 *   and under the curve, which read as a logo cut in half. `edeka.svg` was the
 *   same fault sideways.
 * - **Its edge is lighter than its field.** `lidl.svg` shipped with the blue
 *   inset by 0.522 and a white keyline painted in the gap — right for a white
 *   page, a halo inside a tile. Half a pixel wide, so it was invisible on the
 *   cream card and obvious along the top and left of a dark row.
 *
 * Nothing about the second one shows up in the theme most of this is looked at
 * in, which is why it stood for as long as it did. So it is asserted here
 * rather than left to whoever remembers to open dark mode.
 *
 * What this does NOT catch: a keyline running flush to the edge of a panel
 * that is already square. The corners get sliced, and neither check sees it —
 * coverage is fine because the ground is opaque, and the rim is *darker* than
 * the field rather than lighter, which is the other sign. `aldi.svg` was that
 * bug and is caught here only incidentally, because it was letterboxed too.
 * Telling a line from a fill is intent rather than pixels, so the margin a
 * keyline needs stays a README rule.
 */

const DIR = path.resolve(__dirname, "../assets/brand-logos");
const SIZES = [80, 56, 44] as const; // hero card, board row, mobile bar

/**
 * How far in to sample the field the edge is compared against, and how much
 * lighter the edge may be before it counts as a halo.
 *
 * 2px, not 3. A halo is a thin band at the extreme edge, so the field has to be
 * read from immediately inside it — a probe any deeper starts landing on the
 * panel's own detail and reporting that as a rim. At 3px the correctly framed
 * `aldi.svg` measures 135 against its own keyline in the 44px tile, which is a
 * red suite for a file that is right. At 2px every current panel measures 3 or
 * less, and the smallest real fault in the history here measures 37.
 */
const FIELD_INSET = 2;
const MAX_RIM = 25;

const slug = (file: string) => file.replace(/\.[^.]+$/, "");

const panels = readdirSync(DIR)
  .filter((f) => /\.(svg|png|jpe?g|webp|avif)$/i.test(f))
  .filter((f) => isFullBleedLogo(slug(f)))
  .sort();

const luminance = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/** Every pixel on the ring `inset` in from the edge of a `w`-wide raster. */
const ring = (data: Buffer, w: number, inset: number) => {
  const at = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const out: number[][] = [];
  for (let i = inset; i < w - inset; i++) {
    out.push(at(i, inset), at(i, w - 1 - inset), at(inset, i), at(w - 1 - inset, i));
  }
  return out;
};

/**
 * Rasterise the way the tile does it: `object-contain` into a square, nothing
 * behind. `ensureAlpha` matters — sharp drops the channel for a square source
 * that needs no letterbox, and reading four channels out of three silently
 * turns every measurement into noise.
 */
const edges = async (input: string | Buffer, size: number) => {
  const { data, info } = await sharp(input, { density: 600 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  expect(info.channels).toBe(4);

  const opaque = (px: number[][]) => px.filter((p) => p[3] > 200);
  const outer = ring(data, info.width, 0);
  const outerOpaque = opaque(outer);

  return {
    coverage: outerOpaque.length / outer.length,
    rim:
      mean(outerOpaque.map(luminance)) -
      mean(opaque(ring(data, info.width, FIELD_INSET)).map(luminance)),
  };
};

describe("full-bleed brand logos", () => {
  it("finds the panels to check", () => {
    expect(panels.length).toBeGreaterThan(0);
  });

  it.each(panels)("%s reaches its own frame at every tile size", async (file) => {
    for (const size of SIZES) {
      const { coverage } = await edges(path.join(DIR, file), size);
      expect(coverage, `${file} at ${size}px leaves the tile's ground showing`).toBeGreaterThan(0.99);
    }
  });

  it.each(panels)("%s has no light rim at any tile size", async (file) => {
    for (const size of SIZES) {
      const { rim } = await edges(path.join(DIR, file), size);
      expect(rim, `${file} at ${size}px has a halo on a dark row`).toBeLessThan(MAX_RIM);
    }
  });

  /**
   * A check that never fails is not a check. This is lidl.svg as it shipped —
   * field inset, white ring in the gap — so if the measurement ever stops
   * working, this goes green and says so.
   */
  it("catches the halo it was written for", async () => {
    const haloed = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
         <path fill="#fff" d="M0 0h60v60h-60z"/>
         <path fill="#0050aa" d="M0.522 0.522h58.957v58.957h-58.957z"/>
       </svg>`,
    );
    const { coverage, rim } = await edges(haloed, 56);
    expect(coverage).toBeGreaterThan(0.99); // it does cover the frame — in white
    expect(rim).toBeGreaterThan(MAX_RIM);
  });

  /**
   * And the other way: a panel that is *right* must stay quiet. This is the
   * shape of aldi.svg — white ground, keyline set well in — and it is here
   * because a deeper probe reads that keyline as a rim and turns the suite red
   * over nothing. A red check nobody believes is worse than no check.
   */
  it("does not cry halo at a keyline that is properly set in", async () => {
    const framed = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
         <rect width="100" height="100" fill="#fff"/>
         <rect x="9" y="9" width="82" height="82" fill="none" stroke="#c51718" stroke-width="3"/>
       </svg>`,
    );
    for (const size of SIZES) {
      const { coverage, rim } = await edges(framed, size);
      expect(coverage).toBeGreaterThan(0.99);
      expect(rim, `a 9% keyline read as a halo at ${size}px`).toBeLessThan(MAX_RIM);
    }
  });
});
