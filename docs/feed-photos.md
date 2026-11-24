# Feed photos and thumbnails

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Every feed photo is stored twice, and the thumbnail is found by name
A phone camera writes about 3MB. The mobile feed card shows that photo in a
column 104px wide, and a signed-in feed asks for 50 items — so the feed was
roughly 150MB of image to paint one page, over whatever signal a phone has in
a supermarket. Every upload now stores two objects:

- **the photo**, 1600px on its long edge, which the enlarge dialog opens
- **the thumbnail**, 800px, which every card loads

Measured on the real bucket: 2990KB becomes 30KB, about 110x.

**The thumbnail is `thumb_` in front of the filename, not a `thumbs/` folder**,
and that is forced rather than chosen. The insert policy on `milk-pictures`
ends with `array_length(storage.foldername(name), 1) = 1` — exactly one folder
level, and it has to be the uploader's own id — so both `thumbs/<uid>/x.jpg`
and `<uid>/thumbs/x.jpg` are rejected. Changing that means a migration, and
`/supabase/` waits for the `reviewed` label by design. Three places derive the
name independently (the upload, `FeedImage`, the backfill script); they are
pinned together by `thumbnailPath` and its tests.

**`FeedImage` falls back to the full photo when a thumbnail 404s.** That is
what makes the backfill optional rather than a flag day — a photo with no
thumbnail is slow, never missing. A missing object answers **400** here, not
404, but `onError` does not care which.

Two things that look like omissions and are not:

- **There is no `srcset`.** One thumbnail at 800px serves a card that needs
  ~312px on a phone and ~880px on a retina desktop. Both are wrong by a factor
  too small to see, and a second derivative would double the work a phone does
  before its upload finishes.
- **JPEG, not WebP.** WebP would save perhaps 30% on a file already down to
  30KB, at the cost of the extension no longer matching — and the upload, the
  fallback and the backfill each have to agree about which file exists.

**Resizing must apply EXIF orientation explicitly.** Phone photos are stored
landscape with a tag saying which way is up: the bucket's are 4000x3000 with
`orientation: 6`. `<img>` applies it and a bare `drawImage` does not, so the
browser path asks `createImageBitmap` for `imageOrientation: "from-image"` and
the backfill calls sharp's `rotate()` with no argument. Miss either and every
carton is served on its side.

**Uploads set `cacheControl` to a year.** supabase-js defaults it to `"3600"`,
so a photo went stale after an hour and a reader coming back the next day
revalidated all fifty. The paths carry a timestamp and are never written twice,
so an hour was never the right number. This is the smallest of the wins here —
worth having, not worth confusing with the resize.

**Storage answers every HEAD with `Cache-Control: no-cache`, whatever the
object actually carries.** Only GET reports the stored value. `curl -sI` against
this bucket therefore says `no-cache` for everything, which is how the line
above once claimed the originals were uncached when they were on a one-hour
max-age. Check it with `curl -s -o /dev/null -D -`, or read `metadata.cacheControl`
from the list API.

Two traps this replaced, both of which failed silently for about a year:

- `useCameraOperations` did compress, behind `shouldCompress(file, 5MB)`. No
  phone photo reaches 5MB, so the branch was dead and every original went to
  storage untouched. There is no threshold now.
- `Feed.tsx` preloaded every photo in the feed at once with `decoding: "sync"`,
  so that Edge's full-page screenshot would capture loaded images. It cost real
  phones the entire feed up front to serve a screenshot tool.

## Backfilling the photos that predate all that
`scripts/backfill-image-thumbnails.ts`, run once:

```bash
SUPABASE_SERVICE_ROLE_KEY=... bunx tsx scripts/backfill-image-thumbnails.ts
```

It needs the service role key because it writes into every user's folder and
the policies only let a user write into their own. Pass it for the one run;
it does not belong in `.env` or `.env.example`, and nothing else here wants it.

It reads paths from `milk_tests` rather than listing the bucket, because a
listing also returns the thumbnails it just wrote and the second run would
build thumbnails of thumbnails. It skips photos that already have one, so it is
safe to re-run.

`--replace-originals` is the destructive half and is off by default: it
overwrites photos in place and the resolution it drops is gone. It writes each
original under `backup/` (gitignored — other people's photos) before touching
it. The feed needs nothing from that flag; it only reclaims storage and speeds
up the enlarge dialog. `--dry-run` and `--limit=N` are there to look first.


