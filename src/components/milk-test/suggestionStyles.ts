/**
 * One look for the suggestion panels that hang off the rating form's inputs.
 *
 * There were five copies of the same markup — brand, product name, product
 * search, shop and country — each carrying stock shadcn defaults: `rounded-md`,
 * a bare `border`, `bg-background`, `hover:bg-muted`. Once the fields became
 * story fields that read as a mismatch: a 16px-radius input opening a 6px-radius
 * panel with a different border colour and a grey hover from another palette.
 *
 * Kept as strings in one file rather than a wrapper component because the five
 * lists have genuinely different insides — inline editing, "did you mean",
 * grouped results — and only the surface should be shared. Sharing the surface
 * is what stops it drifting into five surfaces again.
 */

/** The floating panel itself. Pairs with a `relative` positioned parent. */
export const SUGGESTION_PANEL =
  "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border-[1.5px] border-story-ink/[0.12] bg-white shadow-[0_18px_40px_-18px_hsl(var(--story-ink)/0.35)]";

/** Add when the list can run long enough to need scrolling. */
export const SUGGESTION_SCROLL = "max-h-64 overflow-y-auto";

/** A choosable row. */
export const SUGGESTION_ROW =
  "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-[0.9375rem] text-story-ink transition-colors hover:bg-story-cream-2";

/** Secondary actions at the foot of a list, such as "add a new one". */
export const SUGGESTION_ROW_MUTED =
  "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-[0.9375rem] text-story-muted transition-colors hover:bg-story-cream-2 hover:text-story-ink";

/** The "did you mean…" row: a correction offered, not a choice in the list. */
export const SUGGESTION_ROW_HINT =
  "flex cursor-pointer items-center gap-2 border-b border-story-ink/[0.08] bg-story-green-wash px-4 py-2.5 text-left text-[0.875rem] text-story-green-dark transition-colors hover:bg-story-green-light";

/** Non-interactive states: loading, nothing found. */
export const SUGGESTION_NOTE = "px-4 py-3 text-[0.875rem] text-story-muted-2";
