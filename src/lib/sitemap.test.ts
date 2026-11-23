import { describe, it, expect } from "vitest";
import { buildSitemap, productEntries, STATIC_ENTRIES, type RatingRow } from "./sitemap";

const row = (product_id: string | null, created_at: string | null): RatingRow => ({ product_id, created_at });

const A = "4492f935-a86e-4ea8-9280-c7cf6576201c";
const B = "a5d48f1f-db62-40a1-a11b-7bbac2133358";

describe("product entries", () => {
  it("lists a rated product once, however often it was rated", () => {
    const entries = productEntries([
      row(A, "2026-01-05T10:00:00+00:00"),
      row(A, "2026-03-09T11:00:00+00:00"),
      row(A, "2025-12-01T09:00:00+00:00"),
    ]);
    expect(entries).toHaveLength(1);
    // The newest rating is when the page last changed — the ratings are the page.
    expect(entries[0]).toEqual({ path: `/product/${A}`, lastmod: "2026-03-09" });
  });

  it("drops rows that cannot name a page", () => {
    const entries = productEntries([
      row(null, "2026-01-05T10:00:00+00:00"),
      row("not-a-uuid", "2026-01-05T10:00:00+00:00"),
      row(A, null),
      row(B, "2026-02-02T10:00:00+00:00"),
    ]);
    expect(entries.map((e) => e.path)).toEqual([`/product/${B}`]);
  });

  it("orders by id, so the same data builds the same file", () => {
    const one = productEntries([row(B, "2026-01-01T00:00:00Z"), row(A, "2026-01-01T00:00:00Z")]);
    const two = productEntries([row(A, "2026-01-01T00:00:00Z"), row(B, "2026-01-01T00:00:00Z")]);
    expect(one).toEqual(two);
    expect(one[0].path).toBe(`/product/${A}`);
  });
});

describe("the whole file", () => {
  /**
   * The deploy contract. A build must not fail over a sitemap, and a file that
   * is never written is worse than a short one: the assets Worker answers an
   * unknown path with index.html and a 200, so /sitemap.xml would serve HTML.
   */
  it("still writes every fixed route when the fetch failed", () => {
    const xml = buildSitemap(null);
    expect(xml.match(/<loc>/g)).toHaveLength(STATIC_ENTRIES.length);
    expect(xml).toContain("<loc>https://milkmenot.com/results</loc>");
    expect(xml).not.toContain("/product/");
  });

  it("writes a product URL that matches the page's own canonical", () => {
    const xml = buildSitemap([row(A, "2026-03-09T11:00:00+00:00")]);
    // Seo.tsx emits `${SITE_URL}${path}` for path `/product/:id` — no trailing
    // slash. A sitemap URL that disagrees is a second address for one page.
    expect(xml).toContain(`<loc>https://milkmenot.com/product/${A}</loc>`);
    expect(xml).toContain("<lastmod>2026-03-09</lastmod>");
  });

  it("is a well-formed urlset", () => {
    const xml = buildSitemap([row(A, "2026-03-09T11:00:00+00:00")]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
    expect(xml.match(/<url>/g)).toHaveLength(STATIC_ENTRIES.length + 1);
  });
});
