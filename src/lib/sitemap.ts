/**
 * The sitemap, as data and as XML.
 *
 * This lives under src/ rather than beside the script in scripts/ so that
 * vitest collects its tests — the runner only looks at src/**. The script is
 * then the thin half: fetch, hand the rows over, write the file.
 */

export interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const SITE_URL = "https://milkmenot.com";

/** The fixed routes. Every one of these also has its own head written by `routeHeads`. */
export const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/results", changefreq: "daily", priority: "0.9" },
  // The brand index only. Individual /brand/:slug pages are still left out:
  // they are a thinner page than a product's — an owner and a status — and
  // nothing has asked Google for them yet.
  { path: "/brands", changefreq: "weekly", priority: "0.7" },
  { path: "/feed", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/mobile-app", changefreq: "monthly", priority: "0.5" },
  { path: "/install-guide", changefreq: "monthly", priority: "0.4" },
];

/** One rating, as `get_aggregated_milk_tests` returns it. */
export interface RatingRow {
  product_id: string | null;
  created_at: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One entry per product that has been rated at least once.
 *
 * Rated only, deliberately: an unrated product page carries no aggregateRating
 * JSON-LD and little else, which is the kind of page Google files under
 * "crawled — currently not indexed". Today that excludes exactly one of 234.
 *
 * `lastmod` is the newest rating on that product, which is genuinely when the
 * page last changed — the ratings are all the page is.
 */
export const productEntries = (rows: RatingRow[] | null): SitemapEntry[] => {
  if (!rows) return [];

  const newest = new Map<string, string>();
  for (const row of rows) {
    const id = row.product_id;
    if (!id || !UUID.test(id)) continue;

    const day = row.created_at?.slice(0, 10);
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;

    const seen = newest.get(id);
    if (!seen || day > seen) newest.set(id, day);
  }

  // Sorted by id so that two builds of the same data produce the same file.
  return [...newest.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([id, lastmod]) => ({ path: `/product/${id}`, lastmod }));
};

const urlNode = (e: SitemapEntry) =>
  [
    `  <url>`,
    `    <loc>${SITE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    `  </url>`,
  ]
    .filter(Boolean)
    .join("\n");

export const renderSitemap = (entries: SitemapEntry[]): string =>
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map(urlNode),
    `</urlset>`,
  ].join("\n");

/**
 * The whole file. `rows` of null means the fetch failed — the fixed routes are
 * still written, because a build must not fail over a sitemap, and a missing
 * file is worse than a short one: the assets Worker answers any unknown path
 * with index.html and a 200, so /sitemap.xml would serve HTML.
 */
export const buildSitemap = (rows: RatingRow[] | null): string =>
  renderSitemap([...STATIC_ENTRIES, ...productEntries(rows)]);
