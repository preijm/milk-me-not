

## Fix: Feed Page Images Not Visible in Screenshots

### Problem
When taking a browser screenshot of the feed page, not all images are visible. This happens because images that are outside the viewport haven't been loaded yet when the screenshot is captured.

### Root Cause
The feed uses a masonry grid layout that can display many items at once. The browser's default behavior may defer loading images that aren't immediately visible, especially for full-page screenshots that capture content beyond the current viewport.

### Solution
Add the `loading="eager"` attribute to feed images to ensure they load immediately rather than being deferred. This tells the browser to prioritize loading these images regardless of their position relative to the viewport.

### Changes

**File: `src/components/feed/FeedImage.tsx`**

Add the `loading="eager"` attribute to both image elements (the thumbnail and the enlarged dialog image):

```tsx
<img 
  src={imageUrl}
  alt={`${brandName} ${productName}`}
  loading="eager"  // Add this line
  className={cn(
    "w-full h-64 sm:h-80 object-cover transition-transform duration-300 hover:scale-105",
    blurred && "blur-md"
  )}
  // ... existing handlers
/>
```

### Technical Details
- The `loading="eager"` attribute is the browser's default for images, but explicitly setting it ensures consistent behavior
- This change affects both the main feed image and the enlarged dialog image
- Adding `decoding="sync"` could also help ensure images are decoded before the screenshot is taken
- For the feed specifically, this is appropriate since users expect to see all content; for very long lists, lazy loading would normally be preferred

### Trade-offs
- **Pro**: Images will always be visible in screenshots
- **Pro**: Images load immediately when scrolling, no "pop-in" effect
- **Con**: Initial page load may be slightly slower if there are many images (minimal impact since feed is limited to 50 items for authenticated users, 6 for guests)

