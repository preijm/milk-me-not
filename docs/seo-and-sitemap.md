# SEO heads and the sitemap

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Nine routes get their own HTML file, and only the head differs
Every URL used to be served the same `index.html`: one title, one description,
no canonical. The right ones arrived only after React ran. Google reads the raw
file first, and in October 2026 Search Console had four of six known pages
filed as duplicates or "crawled, not indexed".

`routeHeads` in `vite.config.ts` now writes `about.html`, `results.html` and
seven more beside `index.html`, each with its own title, description, canonical
and `og:url`. The strings come from `STATIC_SEO` in `src/lib/staticSeo.ts`,
which the pages' own `<Seo>` calls read too, so the file and the rendered page
cannot disagree. A fixed public page added later wants an entry there.

Three things that look like omissions and are not:

- **`index.html` has no canonical and must not get one.** The Worker serves it
  for every address with no file of its own — `/product/:id`, `/brand/:slug` —
  so a canonical in it would tell Google all of those are the home page.
  Rated products now have files of their own (below); brands and products
  added since the last deploy still fall through to it. That
  is also why `/` is not in `STATIC_SEO`.
- **The body is still empty.** Markup placed in `#root` is torn down and
  redrawn by `createRoot` on every visit — content, spinner, content — unless
  the app hydrates it, which means rendering the whole provider tree in Node.
- **`main.tsx` deletes the canonical the build wrote.** `<Seo>` adds its own a
  moment later. Left in, the build's would sit first in the head and go stale
  on a Back press, and Counterscale reads the first canonical it finds.

They are `about.html`, not `about/index.html`: the Worker serves a file at the
bare path and a folder index at the path with a trailing slash.

## Every rated product gets its own HTML file too
The nine fixed routes were fixed, but `/product/:id` still fell through to
`index.html`: the home page's title, an `og:url` of the home page, and no
canonical. In November 2026 Search Console filed 11 product URLs as "duplicate
without user-selected canonical", and a validation run failed on 24 Nov. The
www and http addresses in that list already 301 to `https://milkmenot.com`; the
real cause was the identical raw HTML.

`scripts/generate-sitemap.ts` already reads every rating, so it now also writes
one head per rated product to `node_modules/.cache/milkmenot/product-heads.json`
(`productHeads` in `src/lib/productSeo.ts`). `routeHeads` reads that file after
the bundle is written and stamps each into `dist/product/<id>.html` with
`htmlForRoute` — the same function the fixed routes use, so the canonical and
`og:url` match the sitemap's `<loc>` exactly. The Worker serves
`product/<id>.html` at `/product/<id>`; checked with `wrangler dev`.
`ProductDetails` builds its `<Seo>` title and description with the same
`productSeo`, so file and page say the same thing.

- **A product rated since the last deploy has no file** and gets `index.html`,
  as every product did before. Deploys follow every merge, so the gap is short.
- **The JSON is always written**, `{}` when the fetch fails, so a stale file
  from an earlier run can never ship old heads.
- **The count in the file can be off by one or two** from what the loaded page
  shows (the page counts with its own query). `<Seo>` replaces it on load; the
  canonical, which is what this is for, never differs.
- **Brand pages are not done yet.** `/brand/:slug` still gets `index.html`.

## The sitemap reads the database, and is not committed
`public/sitemap.xml` was nine hand-written routes. Google still found product
pages — but slowly, and on the wrong host: of the four URLs under "crawled —
currently not indexed" in November 2026, two were `www` product pages. Those
are the pages carrying `aggregateRating` JSON-LD, so they are the ones worth
naming.

`scripts/generate-sitemap.ts` now reads every rating from
`get_aggregated_milk_tests` — the same RPC `useRatingFacts` calls — and writes
one entry per product that has been rated at least once, 233 of 234, each with
`lastmod` set to its newest rating. The builder itself is
`src/lib/sitemap.ts`, not beside the script, because vitest only collects
`src/**` and this wanted tests.

**The file is gitignored, and that is forced rather than tidy.** With a
`lastmod` per product, every `npm run dev` in every worktree rewrites it, and a
tracked file that rewrites itself sits in the working tree waiting for a
`git add -A` — which is the first incident in `worktrees-and-branches.md`. The
` M public/sitemap.xml` that sat in two worktrees for weeks was this already,
in its mildest form.

That only works because **`bun run build` does fire `prebuild`.** Confirmed in a
deploy run log rather than assumed — `bunx tsx scripts/generate-sitemap.ts`
followed by `sitemap.xml written`. If that ever stops being true the site ships
no sitemap at all, and nothing else would say so.

Three things that look like omissions and are not:

- **A failed fetch writes the nine fixed routes and warns, never fails.** A
  short sitemap is a smaller problem than a deploy that does not happen — and a
  *missing* file is worse than both, because the assets Worker answers any
  unknown path with `index.html` and a 200, so `/sitemap.xml` would serve HTML
  and Google would read markup as a sitemap. Proven by pointing the client at
  an unreachable host: 9 entries, exit 0.
- **Unrated products are left out.** That page has no `aggregateRating` and
  little else, which is exactly what lands in "crawled — currently not
  indexed". Today that is one product of 234.
- **Brand pages are still out**, but for a narrower reason than before: a
  `/brand/:slug` page is thinner than a product's — an owner and a trading
  status — not because the list would go stale. That was the old reason and it
  no longer holds for either.

Two traps. Each `<loc>` must match the canonical `Seo.tsx` emits exactly —
`${SITE_URL}${path}`, no trailing slash — or the sitemap invents a second
address for a page. And PostgREST caps a response at 1000 rows by default: 363
today, and past that this truncates silently, with `/results` reading the same
call and thinning out first.


