# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies. Bun is not optional: predev and prebuild both shell out
# to `bunx tsx`, so an npm-only machine cannot run dev or build.
bun install

# Development server (port 8080, override with PORT)
npm run dev

# Build
npm run build        # Production
npm run build:dev    # Development build with full debugging

# Lint. The script is plain `eslint .` — warnings do not fail it, and neither
# does CI. Only lint-staged applies --max-warnings=0, on staged files.
npm run lint

# Type check — build mode, NOT `tsc --noEmit`.
# The root tsconfig is "files": [] plus project references, so plain tsc
# resolves zero files and passes without checking anything.
bunx tsc --build

# Tests
bunx vitest run      # Run once
bunx vitest          # Watch mode

# Run a single test file
bunx vitest run src/lib/security.test.ts

# Local database. Needs Docker Desktop running. See the Supabase notes below —
# `db reset` is local, `db reset --linked` destroys production.
npx supabase start
npx supabase stop
```

## Work in a worktree

**Start every session by calling `EnterWorktree`.** Not optional, and not only
for big changes.

More than one agent works in this repository at once, and they were sharing a
single checkout. In one afternoon that went wrong three times: a branch was
switched out from under a session mid-task, a `git add -A` swept another
session's half-finished Google sign-in into an unrelated commit, and a third
commit landed on somebody else's branch entirely. Each was recoverable, and each
was only caught because someone read the diff before pushing. That is not a
safeguard, that is luck.

A worktree is its own directory and its own branch against the same repository,
so none of that can happen. It costs a few seconds.

```
EnterWorktree             # branches from origin/main, switches the session in
ExitWorktree keep         # leave it on disk to come back to
ExitWorktree remove       # done with it
```

They live in `.claude/worktrees/`, which is gitignored, so they never show up in
`git status` or in a commit. Two things to know: a fresh worktree has no
`node_modules`, so run `bun install` before tests; and the branch is created
from `origin/main` rather than from whatever the main checkout happens to have
checked out, which is usually what you want and occasionally is not.

The one exception is a task that is genuinely about the working copy itself —
inspecting what another session has left uncommitted, say. Then stay put, and
touch nothing you did not put there.

## Architecture

**MilkMeNot** is a community platform for rating plant-based milk alternatives. React 19 + TypeScript SPA built with Vite, Supabase for backend, and Capacitor for mobile.

### Key Libraries
- **Routing:** React Router 7, every page route lazy-loaded (`src/App.tsx`)
- **Server state:** TanStack React Query (5-min stale time)
- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS **v4**. There is no
  `tailwind.config.ts`; v4 is configured in CSS, so the theme lives in an
  `@theme` block in `src/index.css`.
- **Forms:** React Hook Form + Zod validation
- **Maps:** Mapbox GL JS (lazy-loaded due to 200KB+ size)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Mobile:** Capacitor with camera plugin for photo capture

### Barcode scanning decodes two different ways
Scanning is live. `ScanFlow.tsx` opens `milk-test/BarcodeScanner.tsx`, which
reads EAN-13, EAN-8, UPC-A and UPC-E through whichever decoder the platform
offers:

- **`BarcodeDetector`**, the browser's own, via `src/lib/barcodeDetector.ts`.
  Android Chromium backs it with the same ML Kit detector native apps use. It
  reads the video element directly and handles orientation, so it is faster and
  far more tolerant of angle, blur and glare.
- **`@zxing/browser` + `@zxing/library`**, decoding in JavaScript, everywhere
  the native API is missing — all of iOS Safari, and desktop Chrome on Windows.

So neither `@zxing` package is removable: dropping them takes scanning away
from every iPhone. They look unused at a glance because only `BarcodeScanner`
imports them.

`@zxing/browser` must stay at 0.2.1 or later. 0.2.0 declares a peer of
`@zxing/library@^0.22.0` against the pinned ^0.23.0, which npm refuses to
resolve — that is what broke the first Cloudflare deploy.

There is still no `barcode` column on `products`, so a scanned number cannot
pinpoint a row. It is resolved through Open Food Facts
(`src/lib/openFoodFacts.ts`) and then matched on brand, which is fuzzy by
nature — retail names and board names rarely line up. `ScanFlow.tsx` documents
that limitation where it bites.

### Source Layout
```
src/
├── pages/          # Route-level components (lazy-loaded)
├── components/     # Feature components
│   └── ui/        # shadcn/ui base components
├── hooks/          # Custom hooks (20+ hooks extracting complex logic)
├── contexts/       # AuthContext, NotificationContext, VersionContext
├── lib/            # Utility functions and helpers
├── integrations/
│   └── supabase/  # Client + auto-generated DB types
└── types/          # TypeScript interfaces
```

### Data Flow
- **`useAggregatedResults`** — fetches aggregated milk test ratings from Supabase
- **`useResultsUrlState`** / **`useResultsFiltering`** — Results page filter/sort/search.
  Both live in `src/hooks/useResultsState.ts`; there is no hook named after that file.
- **`useMilkTestForm`** — form validation for test submissions
- **`useAuthFlow`** — Supabase auth with email/password + recovery

### Path Aliases
Use `@/*` to resolve to `src/*` in imports (configured in `tsconfig.app.json`).

### Every dialog is the same object
`StoryDialog` (`src/components/story/StoryDialog.tsx`) is the shell for overlays:
kicker, display title, lede, story buttons. Reach for it rather than
`DialogContent` directly, or the overlay arrives in whichever palette it happens
to import — that is how a `#2144ff` Save button ended up under a green avatar.

Two things it encodes that are easy to undo by accident:

- `bg-story-cream` on the surface is load-bearing. `DialogContent` carries
  `bg-background`, a *utility*, while `story-surface` paints in the *base*
  layer, so the utility wins and the card follows the app's token to near-black
  in dark mode. Naming a background gives tailwind-merge a conflict it resolves
  our way.
- Destructive confirmations stay Radix `AlertDialog` — a stray click outside
  must not answer "are you sure". They cannot host a `StoryButton` without
  losing close-on-select, so they borrow `STORY_DIALOG_SURFACE` and
  `STORY_ALERT_ACTION_CLASS` instead.

The palette has no red on purpose. Destructive actions use amber.

### The world map has four things that look wrong and are not
`src/components/MapboxWorldMap.tsx`. Each of these was arrived at the hard way,
so change them knowing what they cost.

**Mapbox does not render in the Claude Code in-app browser.** Tiles never
arrive: the style and iconset load, then nothing, and the component reports
"Map load timeout". Mapbox's *own* documentation example fails in it
identically, so this is the browser, not the map. Do not spend an afternoon
debugging a working map — confirm with a screenshot from a real one.

**The zoom is computed, not chosen.** In globe projection the sphere is
`512 * 2^zoom / π` pixels across, so any fixed zoom crops the globe in some
window sizes: 2 gave a 652px globe in a card 416px tall on a phone.
`fitZoomForHeight` solves that for the card's own height instead. It runs once,
at construction, so a resize across the `sm` breakpoint will not re-fit —
deliberate, because re-fitting would override a zoom the reader had set.

**The atmosphere is two dials, and they fail in opposite directions.**
`horizon-blend` is width: past ~0.05 it stops being a rim and becomes a haze
that fills the card and dithers into visible rings. `high-color` is brightness:
at full `--story-green` the edge outshone every country except Germany, which
is backwards on a map about which countries have ratings. The settled pair is
`0.03` and `hsl(151, 70%, 55%)`. Space is `--story-cream`, the page's own
ground, so the globe sits on the page rather than punching a dark hole in it;
stars are off because there is no night to see them against.

**The popup must not use `properties.name`.** That is each country's name in
its own language, so it renders "Deutschland" on an English page. Use the
module-level `countryName(code)` helper, which goes through
`Intl.DisplayNames(['en'])` like the rest of the page. A local
`const countryName = properties?.name` once shadowed that helper and is exactly
how the bug got in.

Two smaller ones: the load watchdog times *silence* rather than elapsed time —
`dataloading` and `data` reset it, so a slow map is not declared broken — and
its listeners are detached on load, because `data` keeps firing per tile while
panning and would otherwise put an error over a working map. The legend
gradient under the heading hardcodes the same two stops the choropleth
interpolates between; change one and the other lies.

### Every feed photo is stored twice, and the thumbnail is found by name
A phone camera writes about 3MB. The mobile feed card shows that photo in a
column 104px wide, and a signed-in feed asks for 50 items — so the feed was
roughly 150MB of image to paint one page, over whatever signal a phone has in
a supermarket. Every upload now stores two objects:

- **the photo**, 1600px on its long edge, which the enlarge dialog opens
- **the thumbnail**, 800px, which every card loads

Measured on the real bucket: 2990KB becomes 30KB, about 110x.

**The thumbnail is `thumb_` in front of the filename, not a `thumbs/` folder**,
and that is forced rather than chosen. The insert policy on `milk-pictures`
ends with `array_length(storage.foldername(name), 1) = 1` — exactly one folder
level, and it has to be the uploader's own id — so both `thumbs/<uid>/x.jpg`
and `<uid>/thumbs/x.jpg` are rejected. Changing that means a migration, and
`/supabase/` waits for the `reviewed` label by design. Three places derive the
name independently (the upload, `FeedImage`, the backfill script); they are
pinned together by `thumbnailPath` and its tests.

**`FeedImage` falls back to the full photo when a thumbnail 404s.** That is
what makes the backfill optional rather than a flag day — a photo with no
thumbnail is slow, never missing. A missing object answers **400** here, not
404, but `onError` does not care which.

Two things that look like omissions and are not:

- **There is no `srcset`.** One thumbnail at 800px serves a card that needs
  ~312px on a phone and ~880px on a retina desktop. Both are wrong by a factor
  too small to see, and a second derivative would double the work a phone does
  before its upload finishes.
- **JPEG, not WebP.** WebP would save perhaps 30% on a file already down to
  30KB, at the cost of the extension no longer matching — and the upload, the
  fallback and the backfill each have to agree about which file exists.

**Resizing must apply EXIF orientation explicitly.** Phone photos are stored
landscape with a tag saying which way is up: the bucket's are 4000x3000 with
`orientation: 6`. `<img>` applies it and a bare `drawImage` does not, so the
browser path asks `createImageBitmap` for `imageOrientation: "from-image"` and
the backfill calls sharp's `rotate()` with no argument. Miss either and every
carton is served on its side.

**Uploads set `cacheControl` to a year.** Storage defaults these objects to
`no-cache`, so a phone revalidated all fifty feed images on every visit — fifty
round trips before a byte of photo, all of them 304s. The paths carry a
timestamp and are never written twice.

Two traps this replaced, both of which failed silently for about a year:

- `useCameraOperations` did compress, behind `shouldCompress(file, 5MB)`. No
  phone photo reaches 5MB, so the branch was dead and every original went to
  storage untouched. There is no threshold now.
- `Feed.tsx` preloaded every photo in the feed at once with `decoding: "sync"`,
  so that Edge's full-page screenshot would capture loaded images. It cost real
  phones the entire feed up front to serve a screenshot tool.

### Backfilling the photos that predate all that
`scripts/backfill-image-thumbnails.ts`, run once:

```bash
SUPABASE_SERVICE_ROLE_KEY=... bunx tsx scripts/backfill-image-thumbnails.ts
```

It needs the service role key because it writes into every user's folder and
the policies only let a user write into their own. Pass it for the one run;
it does not belong in `.env` or `.env.example`, and nothing else here wants it.

It reads paths from `milk_tests` rather than listing the bucket, because a
listing also returns the thumbnails it just wrote and the second run would
build thumbnails of thumbnails. It skips photos that already have one, so it is
safe to re-run.

`--replace-originals` is the destructive half and is off by default: it
overwrites photos in place and the resolution it drops is gone. It writes each
original under `backup/` (gitignored — other people's photos) before touching
it. The feed needs nothing from that flag; it only reclaims storage and speeds
up the enlarge dialog. `--dry-run` and `--limit=N` are there to look first.

### Styling Conventions
- Semantic HSL colour tokens (score, brand, heatmap) in `src/index.css`, now
  inside the `@theme` block rather than a JS config. Tailwind emits them as
  `oklab`/`oklch`, so a computed value read back in the browser will not
  match the `hsl()` you wrote — it is the same colour, stated differently.
- Dark mode via class strategy
- `useIsMobile` / `useIsMobileOrTablet` (`src/hooks/use-mobile.tsx`) for responsive logic

### Browser tests are separate, and only chromium
`e2e/` holds Playwright specs; `src/**` belongs to vitest, and neither runner
looks at the other's files. They run against `vite preview` serving a real
build, so what is tested is what deploys.

The scanner is the reason they exist. It needs `getUserMedia`, a `<video>` that
carries a stream and a decoder — jsdom has none of those, so no unit test can
tell a working scanner from one reporting "No camera access". Chromium is
started with `--use-fake-device-for-media-stream`, which is also why this works
on a CI runner with no webcam.

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # pick through them interactively
```

Two things the stub in `e2e/support/backend.ts` has to get right, both learned
by getting them wrong:

- **GoTrue returns bare objects**, not `{ data, error }`. A token response
  without an `access_token` sends supabase-js to split a JWT it does not have,
  and the app dies on boot.
- **`.single()` is not a collection.** It asks for
  `application/vnd.pgrst.object+json` and an empty result is a 406 with code
  `PGRST116`, never `[]`. Answering it with an array gave `useVersionCheck` an
  empty array as its version row, and since VersionProvider wraps everything,
  the blank page was the whole site.

**`Browser tests` is a required check**, so a red one blocks the merge like any
other. It was deliberately advisory first: with auto-merge on, a required check
that goes red on a slow runner stops every pull request in the queue, and
browser tests are the flakiest thing in any suite. It was promoted after
running green on every pull request it saw.

Two things keep it from becoming the flaky check that blocks everything. The
suite retries once in CI and nowhere else, so a genuine failure still fails
locally on the first run. And nothing in it waits on live data — every request
is served from a fixture, so there is no network to be slow.

### Testing Setup
- Vitest with jsdom; setup file at `src/test/setup.ts` mocks `matchMedia`, `ResizeObserver`, `IntersectionObserver`
- Tests colocated with source: `src/**/*.{test,spec}.{ts,tsx}`

### Workflows (`.github/workflows/`)
Eight, not one:

- **`ci.yml`** — three sequential stages, **Lint + Type Check → Test → Build**, on
  every PR and push to main. Uses Bun. Cancels in-progress runs on new push.
  A fourth job, **Refresh lockfiles**, regenerates `package-lock.json` for
  Dependabot — but only on a push to main, never on a pull request. That guard
  is load-bearing and is explained in the job's own comment: it used to live
  inside the first job and push to the branch under test, which meant the
  checks reported on a commit that was no longer the head, and a bot commit on
  a Dependabot branch made Dependabot disown the PR and stop rebasing it.
- **`deploy.yml`** — see Deployment below.
- **`codeql.yml`** — static analysis on PRs, pushes to main, and weekly.
- **`release.yml`** — cuts a version tag and a GitHub Release, **on request
  only**: run it from the Actions tab. It fired on every push to main once, and
  since every GitHub Release emails everyone watching, that was 34 releases and
  34 emails in three days — with a version number that meant nothing, because
  adding a test file got the same bump as a feature. Nothing is lost by waiting:
  main deploys on every push regardless, so releasing marks a point rather than
  shipping one.
  It reads the *highest* `v*` tag rather than the newest one `git describe` can
  reach, because `v0.1.0` sits on a `chore(release)` commit that never landed
  on main: describe found nothing, fell back to package.json, recomputed
  `0.1.0`, saw that tag already existed and skipped — every push for months,
  green every time. It tags the commit already on main and pushes only the tag;
  it does not commit, because `main` is protected against the bot, because a
  push to main would retrigger this job, and because the notes quote commit
  subjects that contain the skip marker. `CHANGELOG.md` is hand-written.
- **`auto-merge.yml`** — turns auto-merge on for every non-draft pull request
  into main. It merges nothing itself; it asks GitHub to merge once the four
  required checks pass, so a red pull request still cannot land. Stop it with a
  draft, or with the `hold` label. It uses the app token rather than
  `GITHUB_TOKEN` on purpose: whoever enables auto-merge is recorded as merging
  it later, and a push to main from `GITHUB_TOKEN` starts no workflows — so the
  built-in token could land a merge that never deploys.
- **`alert-on-failure.yml`** — opens an issue when CI, Deploy, CodeQL or
  Release fails **on main**. GitHub sends run notifications to whoever
  triggered the run, and auto-merge lands pull requests through the app, so a
  failed deploy emails `milkmenot-lockfile[bot]` and nobody else. An issue
  notifies regardless and persists until closed. One issue per workflow,
  commented rather than duplicated; main only, since a failing pull request is
  already visible on the pull request.
- **`health-check.yml`** — every six hours, asks the live site whether it is
  alright: does it still serve the app, and is the build it serves the one main
  is on. A deploy that fails leaves the site working and stale, which is the
  failure that looks like success — and is how the update banner stayed broken
  from January to August with every check green. It skips the build comparison
  while a deploy is in flight, and also reports runs parked on "waiting for
  approval", which report nothing anywhere on their own.
- **`sync-labels.yml`** — applies `.github/labels.yml`. Only fires on a push to
  main that touches that file, so editing it is what deploys it. It runs
  `delete-other-labels: true`: a label removed from the file is removed from
  the repository.

### Errors in a visitor's browser
Everything else watches code before it lands or the site after it deploys.
Neither can see a component throwing on a phone in a shop — which is not
hypothetical: a version string arriving as `undefined` got split, the throw went
through every provider, and the page rendered nothing with all checks green.

Two halves, and the first needs no account:

- **`ErrorBoundary`** wraps everything in `main.tsx`, *outside* the providers,
  because the crash it exists for came from inside one. It shows a real page
  with a reload button instead of white. Built from raw markup rather than the
  story components — a boundary that imports half the app can be brought down
  by the module it is meant to catch.
- **`errorReporting.ts`** sends to Sentry, and is inert until `VITE_SENTRY_DSN`
  is set. It also catches what React cannot: a rejected promise in a handler, a
  throw in a timer, a failed dynamic import. Every failure path returns
  quietly — a reporter that throws while reporting is how one broken component
  becomes a broken page.

Two things that are easy to undo by accident. `@sentry/react` contains the
substring "react", so the `manualChunks` rule swallowed the whole SDK into the
eagerly-loaded `vendor-react` — 440KB to 904KB on the critical path. The
`@sentry` rule has to stay *above* the react one. And the DSN belongs in
`connect-src`, not `script-src`; both directives happen to list
counterscale.peterreijm.workers.dev, so a careless edit lands in the wrong one
and the reports are silently blocked.

The DSN is public by design — it ships in the bundle and only permits writing
events — but Vite inlines `VITE_*` at build time, so it has to be a repository
secret set on the *build* step, like the Mapbox key.

### Three paths do not auto-merge
Everything else does. Tests, components, copy and styling land the moment the
checks go green, because the checks are a better reviewer for those than a
tired person at eleven at night, and anything they miss is a redeploy away.

`/supabase/`, `/.github/` and `/public/_headers` are not that. A migration runs
once against real data, `.github/` can quietly switch off everything that would
have caught a change to `.github/`, and a loosened CSP fails nothing and tells
nobody. Those wait for the **`reviewed`** label.

**GitHub's own "require review from code owners" does not do this**, and it
fails silently rather than loudly. It is inert unless
`required_approving_review_count` is at least 1 — a probe pull request touching
`.github/` merged itself with the rule active and the count at zero — and
setting the count to 1 demands an approval on *every* pull request, which is
auto-merge off for the whole repository. There is also no approving your own
pull request, and this repository has one maintainer, so peer review was never
the achievable thing.

`owned-paths.yml` is what actually gates. It reads the patterns out of
CODEOWNERS, so that file stays the single list and GitHub's own interface
agrees with the check by construction. What it buys is not review: it is that a
change to those three paths stops and waits to be merged on purpose, rather
than landing at three in the morning because the tests happened to pass.

### `main` is protected
Two rulesets apply to it, both with a repository-admin bypass:

- **checks must pass** — `Lint & Type Check`, `Test`, `Build`, `CodeQL` and
  `Browser tests` must be green before a pull request merges.
- **delforcepush** — no deletion, no force-push.

Auto-merge is enabled, so `gh pr merge --auto` genuinely queues until the checks
pass rather than merging immediately. Before it was enabled, `--auto` silently
fell through to an instant merge, which is how a pull request once landed with
its checks still running.

### Do not hand-regenerate `package-lock.json`
CI writes it with Node 20. A newer local npm produces a *different* file from
the same command, so committing your version starts a tug-of-war where each
run reverts the other. The lockfile exists only for Dependabot; let the
workflow own it.

### The lockfile pull request needs its own identity
GitHub will not start a workflow for an event created with `GITHUB_TOKEN` — a
deliberate guard against a workflow triggering itself. So the pull request the
lockfile job opens never triggered CI or CodeQL, and `main` requires four
checks: #166 sat with **zero** reported, and the job's own `--auto` merge
waited on results that could not arrive. Every push to main that moved the
lockfile refreshed a pull request that could never merge.

Nothing fixes this from inside the job. One of the four required contexts is
CodeQL, and reporting a synthetic pass for a security analysis that never ran
is not a trade worth making.

So it wants a GitHub App installation token. Create an app with **Contents:
read & write** and **Pull requests: read & write**, install it on this
repository, then set:

- `LOCKFILE_APP_ID` — a repository **variable**, not a secret, because a step
  `if:` cannot read secrets.
- `LOCKFILE_APP_PRIVATE_KEY` — a repository secret holding the app's PEM.

Both the force-push and the `gh pr create` go through that token; doing only
the second leaves a later `synchronize` unchecked, which is the same dead end
one step along.

**Set both or neither.** The job checks for the variable *and* the key before
minting anything, because the id is the easy half to add and an id with no key
sends `create-github-app-token` after a PEM that is not there — turning this
job red on every push to main. Red main is a signal people stop reading.
Configured neither way, it opens nothing and logs a warning rather than
failing: a stale lockfile is a smaller problem than a broken build.

### Never write the CI skip marker into a commit message
GitHub scans the whole commit message, not just the subject. A commit that
merely *discusses* the marker skips its own workflows — which happened here to
the very commit that fixed the job it was describing. Write "skip-ci marker"
in prose, and remember a squash-merge turns a PR body into a commit message
too.

### Deployment
The site is hosted on **Cloudflare Workers**, not Lovable. `deploy.yml` runs on
every push to `main`: test, build, then `bunx wrangler@4 deploy`. No manual
publish step anywhere.

`wrangler.toml` declares an assets-only Worker — there is no `main` script, so
requests are served from the edge without invoking Worker code, which keeps them
free and unmetered. `not_found_handling = "single-page-application"` is what
makes deep links like `/product/:productId` resolve instead of 404ing.

Three repo secrets are required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
and `VITE_MAPBOX_PUBLIC_KEY`. The Mapbox key is set on the *build* step, because
Vite inlines `VITE_*` at build time — setting it on the Worker afterwards is too
late.

Deploy does not use `cloudflare/wrangler-action`. That action installs wrangler
with npm, and npm resolution here has been fragile enough to kill a deploy
before wrangler ever ran. `bunx` uses the same toolchain as every other step.

`milkmenot.com` is on Cloudflare DNS, but mail still runs through IONOS — nine
of the zone's ten records are mail, including three DKIM CNAMEs. Do not touch
DNS records casually.

### An open tab learns about a deploy from `version.json`, not from a table
A loaded single-page app never asks for `index.html` again, so a tab left open
keeps its bundle for as long as it stays open. Cache headers cannot help:
`must-revalidate` is honoured on the next request and there is no next request.

The build stamps a `BUILD_ID` — the commit sha in CI, a timestamp locally —
into the bundle *and* into `dist/version.json`, from the one constant in
`vite.config.ts`. `useVersionCheck` fetches that file at load, when the tab
returns to the foreground (throttled to 5 minutes) and every 30 minutes, and
shows `UpdateBanner` when it differs. Nothing has to be remembered at release
time, which is the whole point.

Two things that look redundant and are not:

- **The fetch treats anything unexpected as "no answer".** The assets Worker
  serves `index.html` with a 200 for any path it cannot find, so a deploy
  missing this file answers with HTML rather than a 404. Reading that as a new
  version would put the banner in front of every reader forever.
- **`app_versions` and `APP_VERSION` still exist, and no longer decide this.**
  That table carries release notes and the native APK rule. It held one row,
  `1.0.0` from January, while the site deployed dozens of times — and because
  `APP_VERSION` is also `1.0.0`, `isNewerVersion` was permanently false and the
  banner could not fire at all. It is fine for that row to be stale now; the
  banner only prints a version number when the row genuinely beats the running
  one.

On a native build this is a no-op by construction: Capacitor serves the bundled
`version.json`, so it always matches and updates stay the APK's business.

### Analytics is Counterscale, and `ht=3` is not a stuck handshake
Cookieless, self-hosted on `counterscale.peterreijm.workers.dev`, loaded by an
inline script in `index.html` with `data-site-id: milkmenot.com`. It is gated on
the live hostname, so `bun dev`, preview deploys and the workers.dev URL never
write into the production dataset, and on a per-browser opt-out remembered in
`localStorage`: `?notrack=1` stops counting this browser, `?notrack=0` starts
again.

**Set `?notrack=1` before debugging the tracker.** Every page loaded while
poking at it is a real pageview in the real dataset, geolocated to wherever you
are. Ten went in this way on 2026-08-24.

Unique visitors are counted without a cookie by riding the HTTP cache. The
tracker calls `/cache?sid=...` first, and the server encodes the hit count in
the *seconds* field of `Last-Modified`: no `If-Modified-Since` returns
`{"ht":1}` with `00:00:01`, sending that back returns `{"ht":2}` with
`00:00:02`, and so on. The number is then passed to `/collect?...&ht=N`. The
state lives entirely in the browser's cache; the Worker keeps nothing.

`ht` reaches 3 and stays there for the rest of the day. That is the design, not
a handshake that failed to complete — Counterscale caps it deliberately, "to
avoid exposing exact hit counts publicly":

- **1** — first visit, and the only value that sets `newVisitor`
- **2** — anti-bounce; the visitor came back for a second page
- **3** — a regular page view, meaning three or more hits

So a browser reporting `ht=3` on every navigation is a healthy session, and
`/cache` answering 200 rather than 304 every time is equally correct. There is
no caching bug there. An afternoon has already been spent looking for one.

### The history patch in `index.html` is load-bearing
Counterscale reads `<link rel="canonical">` in preference to `location`, and it
records a pageview *synchronously* inside its own `pushState` patch. React has
not re-rendered by then, so `react-helmet-async` still has the previous page's
canonical in the DOM from `Seo.tsx` — which filed every client-side navigation
one page behind. Clicking through to `/about` recorded `/`. Cold loads escaped
it only because React has not rendered any canonical yet when the tracker fires
at roughly 334ms, so it falls back to `location`.

The patch wraps `history` *before* the tracker script is appended, so those
wrappers sit inside the tracker's own and the canonical is already correct when
it looks. Two things it encodes that are easy to undo by accident:

- **Order is the whole trick.** Move the patch below the
  `document.head.appendChild` and it wraps nothing — the tracker's wrapper has
  to be the outer one.
- **The `replaceState` pathname guard is not optional.** The tracker patches
  `pushState` and `popstate` but never `replaceState`, so the logged-in
  `<Navigate to="/feed" replace />`, the `ProtectedRoute` redirects and the rate
  deep links went uncounted. They are reported now, but *only* when the pathname
  changes: `useResultsState` rewrites the query string through `replaceState` on
  every filter keystroke, and counting those would bury the real numbers under
  `/results`. The pageview is handed over by calling the tracker's own
  `pushState` wrapper with the real push suppressed underneath, so nothing is
  added to the history stack.

Data recorded before 2026-08-24 still carries the off-by-one, so `/` is inflated
by roughly a hit per session and the exit page of each visit is missing. A trend
line crossing that date changes shape from the fix alone.

### Lovable edits go to the `lovable` branch, never to `main`
Lovable is no longer the host, but its GitHub sync is still connected — kept for
its security scan. That sync commits straight to whichever branch the project
points at, with no pull request, appearing in the history as
`gpt-engineer-app[bot]` ("Visual edit in Lovable", "Lovable update").

While it pointed at `main`, that was a direct write path to production. The
project is now pinned to a long-lived `lovable` branch instead
(Lovable → Project settings → Git → GitHub → branch picker), so edits collect
there and reach `main` only through a reviewed pull request.

**Do not delete the `lovable` branch, and do not point Lovable back at `main`.**

After a Lovable pull request merges, the branch is behind and Lovable would keep
editing a stale base. Fast-forward it:

```bash
git fetch origin; git push origin origin/main:refs/heads/lovable
```

If that push is refused, the branch has commits that never made it into `main` —
usually an edit someone forgot to raise a pull request for. Look before forcing
it.

Two things to know about the picker: Lovable syncs exactly one branch at a time,
and a branch created from within Lovable forks from whatever branch is currently
active rather than from `main`.

### Pre-commit Hooks
Husky + lint-staged run ESLint on staged files before each commit.

### Supabase
- DB types are auto-generated at `src/integrations/supabase/types.ts` — do not edit
  manually. Regenerate with `npm run types:gen`, which needs `supabase login`
  first. On Windows PowerShell, `npx` may be blocked by the execution policy;
  `npx.cmd` or `bunx` get around it without changing any machine settings.
- Edge Functions live under `supabase/functions/` (e.g., `check-rate-limit`)
- Migrations in `supabase/migrations/`

### The Supabase anon key is public on purpose
`src/integrations/supabase/client.ts` has the project URL and anon key written
into it, and they ship in the bundle to every visitor. The same key sits in
older commits of `.env`, which looks alarming and is not: it is the same value
the website already serves, and it carries `"role":"anon"`.

Rotating it would sign every user out and buy nothing. What actually protects
the data is RLS — every table has it enabled, and every write policy carries a
real condition (`auth.uid() = user_id`, `is_admin()`, or `TO service_role`).
Treat RLS as the control, and check it whenever a table is added.

A `service_role` key would be a different matter entirely. None has ever been
committed; keep it that way.

`.env` is gitignored and untracked. `.env.example` carries the names. The only
variable the app actually reads is `VITE_MAPBOX_PUBLIC_KEY` — without it the
map renders its "not configured" state and everything else works.

### The migrations start from a baseline, and three of them are load-bearing
`supabase/migrations/` was 94 files that could not rebuild anything: ten tables
the app reads were never created by any of them, 24 were skipped outright by
the CLI for not matching its `<timestamp>_name.sql` filename format, and 55
more duplicated changes the Lovable dashboard had already applied a second
earlier under a different version. It is now a schema dump of the deployed
database plus what came after.

`00000000000000_baseline.sql` is generated, not written. Do not hand-edit it;
regenerate it if it ever needs to change.

The two files beside it exist because a `--schema public` dump cannot carry
them, and both fail in ways that look fine until they don't:

- **`00000000000001_auth_user_triggers.sql`** — `on_auth_user_created` and
  `on_auth_user_created_assign_role` live on `auth.users`, outside the dumped
  schema. Without them a rebuilt database is healthy until someone signs up
  and gets an account with no profile row and no role.
- **`00000000000002_storage_buckets_and_policies.sql`** — the buckets and
  their eight policies live in `storage`, and buckets are *rows*, so not even
  a `storage` dump would carry them. The app runs until the first upload.

If you ever regenerate the baseline, those two still have to be written by
hand. A dump will not remind you.

### The local database is real, and worth using
`supabase start` builds the whole schema from the baseline and seeds it, which
means policy and migration changes can be tried against a throwaway database
before they reach production. It needs Docker Desktop running.

```bash
npx supabase start     # first run pulls images, several minutes
npx supabase db reset  # rebuild from migrations + seed.sql
npx supabase stop      # snapshots on exit, so the next start is fast
```

`supabase db reset` **resets the local database**. `supabase db reset --linked`
drops and rebuilds *production*. One flag apart; never type the second.

`supabase/seed.sql` holds the country list — 257 ISO regions, minus entries
that are not places (European Union, Eurozone, pseudo-locales) and minus
withdrawn codes that CLDR still resolves to a successor, which would otherwise
list a dozen countries twice and let someone file a rating from East Germany.
It is reference data only; user data never belongs in this repo.

### Migration state is honest now, so trust `migration list`
Local and remote were once 58 files apart, which made `supabase db push`
genuinely dangerous — it would have re-run 55 already-applied migrations, many
of them bare `CREATE TABLE` and `DROP POLICY`. They now match exactly.

```bash
npx supabase migration list --linked   # what is pending, truthfully
npx supabase db push                   # applies only what is genuinely new
```

That gap is also how barcode scanning shipped broken: `ScanFlow.tsx` called
`get_product_by_barcode` for weeks while the function did not exist in
production. The call failed softly, so nothing looked wrong. Check this after
merging anything with a migration in it.

### Backups, because the Free plan has none
`scripts/backup-supabase.ps1` runs monthly through Task Scheduler, registered
by `scripts/register-backup-task.ps1`. Two dumps, deliberately kept apart:

- **community** — public schema only, no auth, no password hashes, no
  addresses. Goes to OneDrive, so it survives the laptop.
- **full** — everything including `auth`: bcrypt hashes and live refresh
  tokens. Stays on the machine. Treat it as a credential store; never commit
  it, never sync it, never paste it anywhere.

The irreplaceable half is the community data. Accounts can be recreated; other
people's ratings cannot.

The task runs only while signed in — storing a Windows password with it is not
a trade worth making — so `backup.log` beside the full dump is what tells you
it is still firing.
