# Design Review: Map view (`/results` → Map)

Reviewed against: `DESIGN.md` (stale — see finding 12) and the shipped story design language (`src/styles/story.css`, `src/components/story/`)
Philosophy: Organic Editorial / "story-first"
Date: 2026-08-17

## Coverage and its limits

| What | Captured | Notes |
|---|---|---|
| Map view, signed out, desktop | Screenshot (inline) | `MapLoginOverlay` — what every logged-out visitor sees |
| Map view, signed in | **Not captured** | `MapboxWorldMap` renders only for authenticated users; reviewed by code + token audit instead |
| Tablet 768 / mobile 375 | **Not captured** | Browser pane stopped compositing mid-review; map is desktop-only regardless (finding 4) |

Contrast figures below are measured from computed styles in the running page, not estimated.

## Summary

The signed-out overlay is genuinely good and fully on-brand. The map itself is the one screen on `/results` that never got the redesign — it carries **zero `story-*` tokens and 21 legacy shadcn ones**, so a signed-in user clicking "Map" lands on what looks like a different product. Separately, the globe spins continuously with no reduced-motion escape, which is an accessibility failure rather than a taste question.

## Must Fix

1. **The map view was never redesigned.** `src/components/MapboxWorldMap.tsx` uses `text-foreground` ×6, `text-muted-foreground` ×6, `border-border` ×3, `bg-card`, `bg-muted` ×2, `bg-background`, `bg-emerald-500/15`, `rounded-lg` ×2, `shadow-lg`, and the shadcn `Button` — and **not one** `story-*` token. Everything around it uses `story-ink`, `StoryCard`, `StoryButton`, `rounded-[1.5rem]` and hairlines. It is the last pre-redesign surface on the page. *Fix: port it to the story primitives — `StoryCard` for the two panels, `StoryButton` for Retry, `story-ink`/`story-muted` for text, and the site's `rounded-[1.5rem]`.*

2. **Continuous globe rotation with no reduced-motion guard** (`MapboxWorldMap.tsx:206–223`). `spinGlobe()` re-arms itself on `moveend`, so the globe turns indefinitely. The animated percentage counter (`:415–432`) is the same problem. Both are JS-driven, so the guard in `story.css:144` cannot reach them — it only neutralises CSS animations inside `.story-surface`. A permanently moving element is a vestibular trigger. *Fix: gate both on `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — skip the spin loop and snap the counter to its final value.*

3. **The toolbar contradicts the view.** In Map view the sort control ("Highest score") is still offered even though it only reorders a list that isn't rendered, and the count reads "Showing 220 of 220 products" when the map is plotting ratings across countries. Both were fixed for the charts view and the map was left behind. *Fix: extend the same `countNoun` / `showSort` props already on `ResultsToolbar` to cover map — likely `countNoun="ratings"` and `showSort={false}`.*

## Should Fix

4. **The map is unreachable on mobile entirely.** The switcher offers only Ranking and Charts on phones, so a signed-in phone user cannot open the map at all — on a site whose stated principle is one responsive site. *Fix: decide deliberately. Either make it reachable and verify Mapbox at 375px, or keep it desktop-only and say so in the UI rather than silently omitting the tab.*

5. **Fixed dimensions that cannot adapt.** The map is `h-[600px]` regardless of viewport, and the legend bar is `w-96` (384px). At the current desktop-only breakpoints these hold, but the legend alone would overflow a 375px screen — so finding 4 has to be solved before this one is safe. *Fix: fluid height (`aspect-[16/10]` with a `min-h`), and `max-w-96 w-full` on the legend.*

6. **Popup styling bypasses the design system.** `onCountryClick` builds raw HTML with hardcoded hex (`#1f2937`) and inline styles (`:303–313`). It cannot follow the tokens and will drift. *Fix: render the popup body from a token-driven template, or mount a small React node into the popup container.*

7. **Country Rankings uses divider lines and is unbounded.** `divide-y divide-border` (`:491`) conflicts with the "No Dividers" rule in `DESIGN.md §5` and with the hairline-and-spacing approach used everywhere else; the list also renders every country with no cap or "show more". *Fix: separate rows with spacing or a `story-hairline`, and cap the initial render the way the ranking does.*

8. **18 `console.*` calls** in the component (`grep -c`). They're stripped in production by the `oxc.transform.drop` config, but they make the dev console unusable while working on this screen.

9. **Emoji in the headline.** `🌍` (`:441`) sits where the rest of the site uses drawn SVG motifs (`MilkDrop`, `TypeMark`, `Sprig`). It renders differently per platform and reads as a placeholder next to the custom artwork.

## Could Improve

10. **The headline stat undersells itself.** "mapped in 6% of countries worldwide" — with 12 countries of 195, framing coverage as a percentage makes a genuine achievement read as a shortfall. *Suggestion: lead with the absolute number ("12 countries, 350 cartons") and keep the percentage as supporting text.*

11. **The legend has no values.** It runs "No tests" → "More tests" with no numbers, so the reader cannot tell whether dark green means 10 ratings or 200. *Suggestion: put tick values on the ramp — the underlying scale is log-based against a max of 150, which is worth exposing.*

12. **`DESIGN.md` is stale and now contradicts the product.** It specifies Epilogue + Manrope (the site ships Plus Jakarta Sans + DM Sans), `rounded-md` buttons, and "don't overuse `rounded-full` pill shapes" — while the shipped design is pill-based throughout. Anyone reviewing against it gets the wrong answer. *Suggestion: rewrite it to describe the story system, or mark it superseded and point at `src/styles/story.css`.*

## What Works Well

- **`MapLoginOverlay` is the model for the rest.** It stays inside the brand at the exact moment it asks for a signup — forest ground, `MilkDrop` motif bleeding off the corner, story kicker/display type, and a real second option for existing members. Measured contrast on the dark panel: heading **14.5:1**, body **7.8:1**, kicker **5.4:1** — all clear of AA.
- **The heatmap encoding is correct.** A single-hue grey→green sequential ramp with log scaling is the right call for magnitude, and it avoids the rainbow trap most choropleths fall into.
- **Map initialisation is unusually defensive** — WebGL support check, a retry loop for zero-size containers on tab switch, a 12s load timeout, an `error` handler, and a user-facing retry. That is real engineering care and should be preserved through any restyle.
