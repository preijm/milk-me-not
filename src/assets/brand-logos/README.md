# Brand logos

Drop a logo in this folder and it appears on every product row, card and
product page for that brand. Nothing else to wire up — `src/lib/brandLogo.ts`
picks up whatever is here at build time.

## Naming

Name the file after the brand as the catalogue spells it, lowercased, with
anything that isn't a letter or number turned into a hyphen:

| Brand in the catalogue | File name          |
| ---------------------- | ------------------ |
| Alpro                  | `alpro.svg`        |
| Oatly!                 | `oatly.svg`        |
| AH Terra               | `ah-terra.png`     |
| Rude Health            | `rude-health.png`  |
| Arla Jörd              | `arla-jord.png`    |
| dmBio                  | `dmbio.png`        |
| BIO+                   | `bio-plus.png`     |

Accents and Nordic letters are folded (`ö` → `o`, `ø` → `o`, `æ` → `ae`),
`+` becomes `plus`, `&` becomes `and`. If a brand is spelled two ways in the
data, add an entry to `ALIASES` in `src/lib/brandLogo.ts` rather than
duplicating the file.

`.svg`, `.png`, `.webp`, `.jpg` and `.avif` all work. SVG is best where you
can get it.

## Two kinds of logo

**A mark on transparency** — a wordmark or symbol with no background of its
own. This is the default. It sits on a white tile with a little padding, which
is what keeps a dark logo readable when the row itself is dark.

**A panel** — a logo that already carries its own coloured background, like
Friesche Vlag's blue shield or Lidl's. These skip the white ground; putting
them on a white tile with padding draws a white ring around a logo that
already has its own edge, and it reads as a picture inside a picture.

Panels are declared in `FULL_BLEED` in `src/lib/brandLogo.ts` — add the slug.

**A panel file has to be square**, and it is the one kind where aspect ratio
really matters. Nothing is ever cropped, so a panel that is not square gets
letterboxed: the tile's own ground shows above and below the coloured block,
and what should read as a tile reads as a logo cut in half. `friesche-vlag.svg`
was 136×113 with the flag swoop along its bottom edge, so at 80px it was a blue
slab across the middle with cream bands top and bottom and a curve receding out
of the lower corners. Its viewBox is now cropped to a square around the crest,
with a blue ground behind it covering whatever the crop leaves of the swoop.

`edeka.svg` had the same fault the other way round — a 32×39 panel, so yellow
slab with cream down both sides. Its viewBox is padded either side instead of
cropped, and the yellow ground is drawn across the whole square. That costs the
mark nothing: `contain` was already fitting a tall panel by its height, so the
E renders at exactly the size it always did and only the slivers change.

Which way round to go is just where the artwork is. Crop when the file has
ground to spare, pad when it does not. Either way the ground goes behind
everything, so the frame can be chosen for how big the mark should read rather
than for what happens to stay opaque.

**A panel whose edge is a line, not a fill, needs real margin.** The tile is
rounded, and a corner of radius `r` eats `0.293r` into the artwork along each
axis. A coloured field does not care — that is just its corner being rounded,
which is the point. A keyline does: it gets sliced and reads as a broken box.
`aldi.svg` is white ground with a red keyline that ran flush to the artwork
edge, so all four corners were cut. Squaring 157×164.26 would not have helped;
the sliver was 2% and the corners stay cut either way. Its frame is 196 square,
which puts the keyline 9.6% in — past the 8.8% the deepest tile costs, the
80px hero card at radius 24. Anything tighter nicks the corners again.

**And a field has to actually reach the edge of the frame.** `lidl.svg` came
with its blue inset by 0.522 and a white ring painted in the gap — the keyline
you want when the logo goes on a white page. Inside a full-bleed tile that ring
is a halo. It is half a pixel wide, so it is invisible on the cream card and
plainly visible along the top and left of a dark row: `contain` centres a
60-unit artwork in a 56 or 44px tile, and the fractional edge rounds up on
those two sides and away on the other two. The ring is gone and the blue covers
the whole viewBox.

Check a panel on a dark row before calling it done. That is the only place a
light edge shows, and it is not the ground you were looking at while framing it.

Frame the file, do not crop it in code. Covering the tile with `object-cover`
was tried and is worse: Edeka's mark is taller than it is wide, so filling the
square pushed its wordmark out of the bottom edge.

To tell which kind a file is without guessing, draw it to a canvas and read
the corner alpha — four opaque, non-white corners means a panel.

## What makes a good file

Logos render inside a small square tile on a white ground, scaled to fit with
`object-contain`, at roughly 28–56px. So:

- **Trim the whitespace.** Padding baked into the file makes the logo look
  small next to its neighbours.
- **Wordmarks beat lockups.** A tall logo with a tagline underneath becomes
  illegible at 32px. Crop to the mark or the wordmark alone.
- **Square beats wide.** The tile is square and nothing is cropped, so a wide
  logo can only ever be as tall as its ratio allows: a 5:1 wordmark lands about
  9px tall in a 48px tile, whatever else you do. Where a brand publishes a
  square variant — usually its app icon at `/apple-touch-icon.png` — prefer
  that over the horizontal wordmark. Jumbo's tile comes from exactly that.
- **Avoid white-on-transparent.** It disappears on the tile. Use the dark or
  full-colour variant — most brands publish both, usually with `-dark` or
  `-black` in the filename.

## Which brands are worth it

Ratings are concentrated. As of the last count, 71 brands share 350 ratings,
but the top 11 cover 58% of them and the top 25 cover 78%. In rough order:

1. Alpro · 2. Oatly! · 3. AH Terra · 4. Jumbo · 5. Natrue · 6. Berief ·
7. Picnic · 8. Bjorg · 9. Natumi · 10. dmBio · 11. Rude Health · 12. My Vay ·
13. Melkan · 14. Vemondo · 15. EDEKA Bio MY VEGGIE · 16. Campina ·
17. Arla Jörd · 18. BioBio · 19. Just Plants · 20. Alnatura

Nineteen of those twenty are covered; only Just Plants is not, and it does not
appear to be a real company. Between them the files here carry **76% of all
ratings from 25 files**, and the whole remaining tail is brands with four
ratings or fewer.

Anything without a file falls back to a three-letter plant-base mark
(`OAT`, `ALM`, `SOY`…), which is a deliberate design, not a broken state — so
there is no need to chase all 71. Adding a file for a brand with two ratings
costs a download on every build and buys almost nothing; check the brand's
rating count before hunting for its logo.

## A note on rights

These are third-party trademarks. Using them to identify the product being
reviewed is ordinary editorial practice, but they are not ours, so don't use
them anywhere that implies endorsement or partnership.

Most files here came from Wikimedia Commons as **PD-textlogo** — a wordmark
too simple to attract copyright — or straight from the brand's own site. Those
carry no attribution obligation; only the trademark rule above applies.

**One exception:** `netto.svg` is **CC BY-SA 4.0**, not public domain. Shipping
it means crediting Netto Marken-Discount via Wikimedia Commons somewhere
user-visible. Until that credit exists, either add it or drop the file — it
only serves the BioBio own-brand, which the fallback mark covers fine.
