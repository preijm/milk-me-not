
# Fix Mobile Feed Centering

## Problem
The feed cards on mobile appear left-aligned instead of centered. This is caused by the Masonry grid's column styling (`pl-4` padding-left) which creates an offset when there's only a single column on mobile.

## Solution
For the mobile variant, we need to adjust the styling approach to properly center the single-column layout:

1. **Update FeedGrid.tsx** - Add specific mobile styling that removes the left padding offset on the column when in single-column mode, and centers the content properly.

2. **Update FeedContent.tsx** - Pass a flag or different className to indicate mobile mode so we can apply appropriate centering styles.

## Technical Details

### File: `src/components/feed/FeedGrid.tsx`
- Modify the `columnClassName` to conditionally remove `pl-4` on mobile (or apply it symmetrically)
- Use `className` more effectively to center the single column
- Option A: Use CSS to override the masonry default margins for mobile
- Option B: Pass a `variant` prop and conditionally change the columnClassName

### File: `src/components/feed/FeedContent.tsx`  
- Pass a `variant` prop to `FeedGrid` to signal mobile layout
- Adjust the wrapper div styling to properly center the grid

### Recommended Changes

**FeedGrid.tsx:**
```tsx
interface FeedGridProps {
  items: MilkTestResult[];
  isAuthenticated: boolean;
  className?: string;
  variant?: "mobile" | "desktop";
}

export const FeedGrid = ({ items, isAuthenticated, className, variant = "desktop" }: FeedGridProps) => {
  // For mobile single-column, remove the left margin offset
  const masonryClassName = variant === "mobile" 
    ? "flex w-full justify-center" 
    : (className || "flex -ml-4 w-auto");
  
  // For mobile, remove left padding that causes offset
  const columnClass = variant === "mobile"
    ? "space-y-4 w-full max-w-md mx-auto"
    : "pl-4 space-y-4";

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={masonryClassName}
      columnClassName={columnClass}
    >
      {/* ... items */}
    </Masonry>
  );
};
```

**FeedContent.tsx:**
```tsx
// Pass variant to FeedGrid
<FeedGrid
  items={items}
  isAuthenticated={isAuthenticated}
  variant={variant}
/>
```

This approach:
- Removes the negative margin/padding combo that causes left alignment
- Centers the column using `mx-auto` and flex centering
- Constrains card width with `max-w-md` for a nice mobile appearance
- Keeps desktop multi-column layout unchanged
