// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
//
// The file is generated, not committed — it is gitignored, because it now
// carries a `lastmod` per product and would otherwise leave a dirty working
// tree behind every dev server start.
//
// `bun run build` does fire prebuild, so what deploys is what this writes.
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { supabase } from "../src/integrations/supabase/client";
import { buildSitemap, type RatingRow } from "../src/lib/sitemap";
import { productHeads, type ProductRatingRow } from "../src/lib/productSeo";
import { PRODUCT_HEADS_FILE } from "../src/lib/staticSeo";

const TIMEOUT_MS = 10_000;

/**
 * Every rating, which is how the board itself reads them — the same RPC
 * `useRatingFacts` calls. `milk_tests_aggregated_view` answers anon with zero
 * rows, so it cannot be used here.
 *
 * Note PostgREST's default 1000-row ceiling: 363 rows today, and past 1000 this
 * truncates silently. /results reads the same call and would thin out first.
 *
 * Returns null for "no answer", which is the signal to write the fixed routes
 * alone rather than to fail the build.
 */
async function fetchRatings(): Promise<(RatingRow & ProductRatingRow)[] | null> {
  try {
    const { data, error } = await supabase
      .rpc("get_aggregated_milk_tests")
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));

    if (error) throw new Error(error.message);
    if (!Array.isArray(data)) throw new Error("expected an array of ratings");
    return data as (RatingRow & ProductRatingRow)[];
  } catch (err) {
    // A warning rather than a failure, on purpose: a stale or short sitemap is
    // a smaller problem than a deploy that does not happen. GitHub surfaces
    // ::warning:: on the run without turning it red.
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`::warning::sitemap: could not read ratings (${reason}); writing fixed routes only`);
    return null;
  }
}

const rows = await fetchRatings();
const xml = buildSitemap(rows);
writeFileSync(resolve("public/sitemap.xml"), xml);

const count = xml.match(/<loc>/g)?.length ?? 0;
console.log(`sitemap.xml written (${count} entries, ${rows ? `${rows.length} ratings read` : "no ratings"})`);

// The same rows, as one head per rated product. `routeHeads` in vite.config.ts
// reads this after the bundle is written and stamps each into
// dist/product/<id>.html. Always written — `{}` when the fetch failed — so a
// file left over from an earlier run can never ship stale heads.
const heads = productHeads(rows);
const headsPath = resolve(PRODUCT_HEADS_FILE);
mkdirSync(dirname(headsPath), { recursive: true });
writeFileSync(headsPath, JSON.stringify(heads));
console.log(`product heads written (${Object.keys(heads).length} products)`);
