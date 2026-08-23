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
```

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

### Styling Conventions
- Semantic HSL colour tokens (score, brand, heatmap) in `src/index.css`, now
  inside the `@theme` block rather than a JS config. Tailwind emits them as
  `oklab`/`oklch`, so a computed value read back in the browser will not
  match the `hsl()` you wrote — it is the same colour, stated differently.
- Dark mode via class strategy
- `useIsMobile` / `useIsMobileOrTablet` (`src/hooks/use-mobile.tsx`) for responsive logic

### Testing Setup
- Vitest with jsdom; setup file at `src/test/setup.ts` mocks `matchMedia`, `ResizeObserver`, `IntersectionObserver`
- Tests colocated with source: `src/**/*.{test,spec}.{ts,tsx}`

### Workflows (`.github/workflows/`)
Five, not one:

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
- **`release.yml`** — versioning and changelog on push to main.
- **`sync-labels.yml`** — applies `.github/labels.yml`. Only fires on a push to
  main that touches that file, so editing it is what deploys it. It runs
  `delete-other-labels: true`: a label removed from the file is removed from
  the repository.

### `main` is protected
Two rulesets apply to it, both with a repository-admin bypass:

- **checks must pass** — `Lint & Type Check`, `Test` and `Build` must be green
  before a pull request merges.
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

### The migrations are not a complete schema
`supabase/migrations/` cannot rebuild the database. It has no baseline: ten of
the tables the app reads — `products`, `milk_tests`, `profiles`, `brands`,
`shops`, `flavors`, `properties`, `names`, `product_flavors`,
`product_properties` — are never created by any migration, and the earliest
file already does `INSERT INTO public.profiles`. The original schema was
created outside migrations and the folder starts mid-life, so every file
assumes a database that already exists.

What this means in practice: the deployed database is the source of truth, not
this folder. Read the schema from `src/integrations/supabase/types.ts`, which
is generated from the live database. Do not assume a migration you are looking
at ever ran, and do not assume adding one makes a fresh environment work.

Fixing it means capturing a baseline from the live database, which needs
credentials this repo does not carry:

```bash
supabase db dump --schema public -f supabase/migrations/00000000000000_baseline.sql
```

That file would have to sort before every existing migration, and the existing
ones would then need to tolerate re-running against it.
