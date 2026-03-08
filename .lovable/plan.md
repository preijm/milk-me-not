

## Consolidate to a Single Toast System

The app has two toast libraries installed but only uses one. Sonner is installed and has a wrapper component (`src/components/ui/sonner.tsx`) but is never imported or used anywhere else in the codebase. All 33+ files use the Radix UI toast system via `useToast` from `@/hooks/use-toast`.

### Changes

1. **Delete `src/components/ui/sonner.tsx`** -- unused wrapper component.

2. **Remove `sonner` and `next-themes` from `package.json`** -- Sonner is the only consumer of `next-themes`, and neither package is used elsewhere.

3. **Verify no Sonner `<Toaster>` is rendered in `App.tsx`** -- confirm only the Radix `<Toaster>` from `src/components/ui/toaster.tsx` is mounted (already the case based on the summary).

Three files changed, two packages removed. No functional impact since Sonner was never called.

