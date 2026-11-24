# The world map

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## The world map has four things that look wrong and are not
`src/components/MapboxWorldMap.tsx`. Each of these was arrived at the hard way,
so change them knowing what they cost.

**Mapbox does not render in the Claude Code in-app browser.** Tiles never
arrive: the style and iconset load, then nothing, and the component reports
"Map load timeout". Mapbox's *own* documentation example fails in it
identically, so this is the browser, not the map. Do not spend an afternoon
debugging a working map — confirm with a screenshot from a real one.

**The zoom is computed, not chosen.** In globe projection the sphere is
`512 * 2^zoom / π` pixels across, so any fixed zoom crops the globe in some
window sizes: 2 gave a 652px globe in a card 416px tall on a phone.
`fitZoomForHeight` solves that for the card's own height instead. It runs once,
at construction, so a resize across the `sm` breakpoint will not re-fit —
deliberate, because re-fitting would override a zoom the reader had set.

**The atmosphere is two dials, and they fail in opposite directions.**
`horizon-blend` is width: past ~0.05 it stops being a rim and becomes a haze
that fills the card and dithers into visible rings. `high-color` is brightness:
at full `--story-green` the edge outshone every country except Germany, which
is backwards on a map about which countries have ratings. The settled pair is
`0.03` and `hsl(151, 70%, 55%)`. Space is `--story-cream`, the page's own
ground, so the globe sits on the page rather than punching a dark hole in it;
stars are off because there is no night to see them against.

**The popup must not use `properties.name`.** That is each country's name in
its own language, so it renders "Deutschland" on an English page. Use the
module-level `countryName(code)` helper, which goes through
`Intl.DisplayNames(['en'])` like the rest of the page. A local
`const countryName = properties?.name` once shadowed that helper and is exactly
how the bug got in.

Two smaller ones: the load watchdog times *silence* rather than elapsed time —
`dataloading` and `data` reset it, so a slow map is not declared broken — and
its listeners are detached on load, because `data` keeps firing per tile while
panning and would otherwise put an error over a working map. The legend
gradient under the heading hardcodes the same two stops the choropleth
interpolates between; change one and the other lies.


