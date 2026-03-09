

## Tailwind v4 Migration Plan

### Current State

The project is **partially migrated**. The CSS (`src/index.css`) already uses Tailwind v4 syntax (`@import "tailwindcss"`, `@theme inline`, `@variant dark`), and `vite.config.ts` uses `@tailwindcss/vite`. However, **4 legacy v3 packages** remain in `package.json` that can cause build conflicts:

- `tailwindcss-animate` (replaced by `tw-animate-css`, already installed)
- `@tailwindcss/typography` (v3 plugin, not used anywhere)
- `autoprefixer` (not needed with v4)
- `postcss` (not needed with `@tailwindcss/vite`)

### Plan

#### Step 1 -- Remove leftover v3 packages from `package.json`
Remove these four entries to prevent the dev server from loading the v3 PostCSS pipeline:
- `tailwindcss-animate` from dependencies
- `@tailwindcss/typography` from devDependencies
- `autoprefixer` from devDependencies
- `postcss` from devDependencies

#### Step 2 -- Clean up duplicate CSS variable declarations
`src/index.css` and `src/styles/design-tokens.css` both declare the same `:root` variables (score colors, status colors, brand colors, heatmap colors, surface colors) with slightly different hue values (e.g. `145` vs `151` for `--score-excellent`). Consolidate into one source of truth in `design-tokens.css` and remove the duplicates from `index.css`.

#### Step 3 -- Verify `@layer` compatibility
Tailwind v4 changed how `@layer` works. The `@layer base` and `@layer components` blocks in `index.css` using `@apply` should still work, but need verification. If issues arise, convert `@apply` usages to plain CSS properties.

#### Step 4 -- Verify calendar component
`src/components/ui/calendar.tsx` was updated for `react-day-picker` v9 during the migration. Confirm the component renders correctly with the new API.

#### Step 5 -- Build and visual verification
Run the preview and navigate all major routes (Home, Feed, Results, About, Contact, Profile, Account) to confirm no styling regressions.

### Risk Assessment
- **Low risk**: Package removal is safe since replacements are already in place
- **Medium risk**: CSS variable deduplication could surface hue mismatches if components rely on specific values
- **Estimated effort**: ~15 minutes of implementation

