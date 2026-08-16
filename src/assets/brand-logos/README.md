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

## What makes a good file

Logos render inside a small square tile on a white ground, scaled to fit with
`object-contain`, at roughly 28–56px. So:

- **Trim the whitespace.** Padding baked into the file makes the logo look
  small next to its neighbours.
- **Wordmarks beat lockups.** A tall logo with a tagline underneath becomes
  illegible at 32px. Crop to the mark or the wordmark alone.
- **Avoid white-on-transparent.** It disappears on the tile. Use the dark or
  full-colour variant.

## Which brands are worth it

Ratings are concentrated. As of the last count, 71 brands share 350 ratings,
but the top 11 cover 58% of them and the top 25 cover 78%. In rough order:

1. Alpro · 2. Oatly! · 3. AH Terra · 4. Jumbo · 5. Natrue · 6. Berief ·
7. Picnic · 8. Bjorg · 9. Natumi · 10. dmBio · 11. Rude Health · 12. My Vay ·
13. Melkan · 14. Vemondo · 15. EDEKA Bio MY VEGGIE · 16. Campina ·
17. Arla Jörd · 18. BioBio · 19. Just Plants · 20. Alnatura

Anything without a file falls back to a three-letter plant-base mark
(`OAT`, `ALM`, `SOY`…), which is a deliberate design, not a broken state — so
there is no need to chase all 71.

## A note on rights

These are third-party trademarks. Using them to identify the product being
reviewed is ordinary editorial practice, but they are not ours, so don't use
them anywhere that implies endorsement or partnership.
