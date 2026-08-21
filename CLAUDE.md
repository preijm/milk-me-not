# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development server (port 8080)
npm run dev

# Build
npm run build        # Production
npm run build:dev    # Development build with full debugging

# Lint (max-warnings=0)
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
- **Routing:** React Router 7 with 17 lazy-loaded page routes (`src/App.tsx`)
- **Server state:** TanStack React Query (5-min stale time)
- **UI:** shadcn/ui (Radix UI primitives) + Tailwind CSS with HSL design tokens
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
│   └── ui/        # 49 shadcn/ui base components
├── hooks/          # Custom hooks (20+ hooks extracting complex logic)
├── contexts/       # AuthContext, NotificationContext, VersionContext
├── lib/            # Utility functions and helpers
├── integrations/
│   └── supabase/  # Client + auto-generated DB types
└── types/          # TypeScript interfaces
```

### Data Flow
- **`useAggregatedResults`** — fetches aggregated milk test ratings from Supabase
- **`useResultsState`** / **`useResultsUrlState`** — Results page filter/sort/search state stored in URL params
- **`useMilkTestForm`** — form validation for test submissions
- **`useAuthFlow`** — Supabase auth with email/password + recovery

### Path Aliases
Use `@/*` to resolve to `src/*` in imports (configured in `tsconfig.app.json`).

### Styling Conventions
- Tailwind CSS with semantic HSL color tokens (score, status, brand, heatmap) defined in `src/index.css`
- Dark mode via class strategy
- `isMobile` hook for responsive logic

### Testing Setup
- Vitest with jsdom; setup file at `src/test/setup.ts` mocks `matchMedia`, `ResizeObserver`, `IntersectionObserver`
- Tests colocated with source: `src/**/*.{test,spec}.{ts,tsx}`

### CI Pipeline (`.github/workflows/ci.yml`)
Three sequential stages: **Lint + Type Check → Test → Build**. Uses Bun. Cancels in-progress runs on new push.

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
