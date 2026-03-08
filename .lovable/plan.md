

# Mobile Performance Improvement Plan

## Current State

The app already has good foundations: route-level code splitting with `React.lazy()`, vendor chunk separation, CSS-only backgrounds, and a mobile-first design. However, several opportunities remain to improve Largest Contentful Paint (LCP), Total Blocking Time (TBT), and Cumulative Layout Shift (CLS) on mobile.

## Optimizations

### 1. Reduce initial JavaScript on the critical path

**Problem**: `NotificationProvider` and `VersionProvider` wrap the entire app and fire Supabase queries (notifications, version check) on mount -- even for unauthenticated visitors on the Home page. This delays interactivity.

**Fix**: Defer these providers so they don't block the initial render:
- Move `NotificationProvider` inside the `BrowserRouter` and only render it after auth is resolved, or lazy-initialize its data fetching.
- Make `VersionProvider` lazy -- don't fetch version data until after the first paint (e.g., use `requestIdleCallback` or a short `setTimeout`).

**File**: `src/App.tsx`, `src/contexts/NotificationContext.tsx`, `src/contexts/VersionContext.tsx`

---

### 2. Eliminate render-blocking `initializeSecurity()` in main.tsx

**Problem**: `initializeSecurity()` runs synchronously before `createRoot`, adding DOM meta tags that could be static HTML instead.

**Fix**:
- Move the static meta tags (`referrer`, `X-Content-Type-Options`, `X-XSS-Protection`) directly into `index.html` as plain HTML tags.
- Remove the synchronous `initializeSecurity()` call from `main.tsx`, or defer the CSP meta tag injection to `requestIdleCallback`.

**Files**: `index.html`, `src/main.tsx`, `src/lib/securityHeaders.ts`

---

### 3. Remove `animate-pulse` from trust indicators

**Problem**: The three trust indicator dots use `animate-pulse`, which triggers continuous compositor/paint work on mobile. With three always-pulsing elements, this wastes battery and can cause jank.

**Fix**: Replace `animate-pulse` with a one-shot fade-in animation, or remove the animation entirely. The dots are purely decorative and don't need to continuously animate.

**File**: `src/components/home/TrustIndicators.tsx`

---

### 4. Remove `backdrop-blur` from mobile-visible elements

**Problem**: `backdrop-blur-sm` on `MobileFooter` (`bg-white/95 backdrop-blur-sm`) and `MenuBar` triggers expensive GPU compositing on every scroll frame on low-end mobile devices.

**Fix**: Replace with solid `bg-white` on mobile. Keep the blur effect only on desktop where GPU power is sufficient:
- MobileFooter: change to `bg-white` (no blur needed, it's already `white/95`)
- MenuBar mobile: use solid `bg-white` instead of blur
- ResultsContainer fixed filter bar: same treatment

**Files**: `src/components/MobileFooter.tsx`, `src/components/MenuBar.tsx`, `src/components/milk-test/ResultsContainer.tsx`

---

### 5. Optimize `BackgroundPattern` animation on mobile

**Problem**: The "milk splash" div runs a continuous CSS animation (`gentlePulse 4s infinite`) with `transform: scale()` and `opacity` changes. While lightweight, it's unnecessary on mobile.

**Fix**: Disable the animation on mobile using `prefers-reduced-motion` or a media query:
```css
@media (max-width: 767px) {
  .milk-splash { animation: none; }
}
```
Or conditionally skip rendering the animated element on mobile.

**File**: `src/components/BackgroundPattern.tsx`

---

### 6. Preconnect to Supabase Storage CDN

**Problem**: Feed images and product images load from `jtabjndnietpewvknjrm.supabase.co/storage/...`. The preconnect in `index.html` already covers the main domain, but adding a `dns-prefetch` as a fallback improves connection setup.

**Fix**: Add `<link rel="dns-prefetch" href="https://jtabjndnietpewvknjrm.supabase.co">` alongside the existing preconnect for broader browser support.

**File**: `index.html`

---

### 7. Add `fetchpriority="high"` to the logo image (LCP candidate)

**Problem**: The logo is the largest contentful paint element on many pages. It already has `loading="eager"` but lacks `fetchpriority`.

**Fix**: Add `fetchpriority="high"` to the logo `<img>` tag in `Logo.tsx`.

**File**: `src/components/menu/Logo.tsx`

---

### 8. Remove duplicate CSS layer declarations

**Problem**: `index.css` declares `@layer base { * { @apply border-border; } }` twice (lines 8 and 250), and `body { @apply bg-background text-foreground; }` is also declared twice. This bloats the CSS output slightly and could cause specificity confusion.

**Fix**: Remove the duplicate block at lines 250-257.

**File**: `src/index.css`

---

## Summary of Impact

| Optimization | Metric Improved | Effort |
|---|---|---|
| Defer NotificationProvider/VersionProvider | TBT, TTI | Medium |
| Static security meta tags | TBT | Low |
| Remove animate-pulse | Battery, paint | Low |
| Remove backdrop-blur on mobile | Scroll jank, FPS | Low |
| Disable background animation on mobile | Battery, paint | Low |
| DNS-prefetch fallback | LCP (images) | Low |
| fetchpriority on logo | LCP | Low |
| Remove duplicate CSS | Bundle size (minor) | Low |

## Technical Details

All changes preserve existing visual design. The backdrop-blur removal on mobile is imperceptible since the backgrounds are already near-opaque white. The animation removals only affect decorative elements. Provider deferral is an internal optimization with no UX impact.

