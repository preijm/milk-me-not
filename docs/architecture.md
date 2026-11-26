# Architecture

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Architecture

**MilkMeNot** is a community platform for rating plant-based milk alternatives. React 19 + TypeScript SPA built with Vite, Supabase for backend, and Capacitor for mobile.

## Key Libraries
- **Routing:** React Router 7, every page route lazy-loaded (`src/App.tsx`)
- **Server state:** TanStack React Query (5-min stale time)
- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS **v4**. There is no
  `tailwind.config.ts`; v4 is configured in CSS, so the theme lives in an
  `@theme` block in `src/index.css`.
- **Forms:** hand-rolled, and there is no form library here at all.
  `useMilkTestForm` is `useState` plus `validateMilkTestInput` from
  `src/lib/security.ts`; Zod is used elsewhere, but no form goes through it.
  The shadcn form stack was removed in November 2026 — `@hookform/resolvers`
  first (#338), which nothing imported at all, then `react-hook-form` and the
  `src/components/ui/form.tsx` that was its only importer, which in turn had no
  importers of its own and no `useForm(` caller anywhere. They had to go in that
  order: `tsc --build` checks every file under `src/` whether or not anything
  imports it, so the package could not leave before the file did. If a real form
  ever wants a library, add it back deliberately rather than reaching for
  `ui/form.tsx` in git history — nothing in the app was ever built against it.
- **Maps:** Mapbox GL JS (lazy-loaded due to 200KB+ size)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Mobile:** Capacitor with camera plugin for photo capture

## Barcode scanning decodes two different ways
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

## How a scan finds its product
A barcode the board has seen before is exact. `product_barcodes` maps it to a
product — a table of its own rather than a column on `products`, because a
barcode is a fact about a package — and `get_product_by_barcode` sends the
reader straight there.

A barcode it has not seen is the fuzzy case. The number goes to Open Food
Facts (`src/lib/openFoodFacts.ts`), and the brand it returns searches the
board. Retail names and board names rarely line up — OFF calls a carton
"OAT-LY! iKAFFE BARISTA EDITION" where the board says "Oat" by "Oatly!" — so
`suggestFromScan` reads the milk base, flavours and properties out of OFF's
category tags instead, in the board's own keys, and `rankScanMatches` puts the
rows that agree with them first. Only eight fit the dialog; an Alpro search
returns 27.

**The reader's tap is what teaches the board.** Every way out of the scan that
ends on a product records the barcode against it: picking a row, the one-tap
add (`createScannedProduct.ts`), and saving the full form at `/add-product`,
which reads the scan from router state — including when that save turns out to
be a duplicate of an existing product. A path that skips this is a scan the
board learns nothing from; that is how the table held one row for three months.

**First write wins, so the dialog always asks.** `remember_product_barcode`
ignores a barcode it already knows, so a later scanner cannot quietly move one
— and a wrong one stays wrong. That is why a brand search with a single result
still shows it as a question with a "Not here?" way out, rather than going
straight through: a brand with only its Oat on the board would otherwise take
its Almond carton's barcode for good. Correcting one is an admin job, in the
Barcodes section of the product edit dialog (`ProductBarcodes.tsx`), backed by
the three `admin_*_product_barcode(s)` functions, which log every change to
`security_log` with what it replaced.

## Source Layout
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

## Data Flow
- **`useAggregatedResults`** — fetches aggregated milk test ratings from Supabase
- **`useResultsUrlState`** / **`useResultsFiltering`** — Results page filter/sort/search.
  Both live in `src/hooks/useResultsState.ts`; there is no hook named after that file.
- **`useMilkTestForm`** — form validation for test submissions
- **`useAuthFlow`** — Supabase auth with email/password + recovery

## Path Aliases
Use `@/*` to resolve to `src/*` in imports (configured in `tsconfig.app.json`).

## Every dialog is the same object
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


## Styling Conventions
- Semantic HSL colour tokens (score, brand, heatmap) in `src/index.css`, now
  inside the `@theme` block rather than a JS config. Tailwind emits them as
  `oklab`/`oklch`, so a computed value read back in the browser will not
  match the `hsl()` you wrote — it is the same colour, stated differently.
- Dark mode via class strategy
- `useIsMobile` / `useIsMobileOrTablet` (`src/hooks/use-mobile.tsx`) for responsive logic


## Testing Setup
- Vitest with jsdom; setup file at `src/test/setup.ts` mocks `matchMedia`, `ResizeObserver`, `IntersectionObserver`
- Tests colocated with source: `src/**/*.{test,spec}.{ts,tsx}`


## Pre-commit Hooks
Husky + lint-staged run ESLint on staged files before each commit.


