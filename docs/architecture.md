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

There is still no `barcode` column on `products`, so a scanned number cannot
pinpoint a row. It is resolved through Open Food Facts
(`src/lib/openFoodFacts.ts`) and then matched on brand, which is fuzzy by
nature — retail names and board names rarely line up. `ScanFlow.tsx` documents
that limitation where it bites.

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


