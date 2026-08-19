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

### Barcode scanning is not implemented
`BarcodeScanner.tsx` and `BarcodeResultDialog.tsx` exist but nothing imports
them, and the scanner itself is a mockup — a dashed placeholder box and a
"Simulate Scan" button hardcoded to one barcode. `@zxing/browser` and
`@zxing/library` are installed and imported nowhere. There is also no `barcode`
column on `products`, so a scan has nothing to resolve against. Building it for
real means a migration, populating codes for the catalogue, and a scanner —
not reconnecting what is there.

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
- DB types are auto-generated at `src/integrations/supabase/types.ts` — do not edit manually
- Edge Functions live under `supabase/functions/` (e.g., `check-rate-limit`)
- Migrations in `supabase/migrations/`
