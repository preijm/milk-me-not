/**
 * Give every photo already in `milk-pictures` the thumbnail the feed now asks
 * for, and — only when asked — shrink the original beside it.
 *
 * The app resizes on upload as of this change, but 93 photos were stored
 * before it did, at 2.9-4.5MB each. Without this script the feed keeps serving
 * those: `FeedImage` falls back to the full photo whenever a thumbnail is
 * missing, so nothing breaks, it just stays slow for everything posted until
 * today.
 *
 * Run it once:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... bunx tsx scripts/backfill-image-thumbnails.ts
 *
 * It needs the service role key because it writes into every user's folder,
 * and the storage policies quite rightly only let a user write into their own.
 * That key is never committed and never belongs in `.env.example` — take it
 * from the Supabase dashboard, pass it for the one run, and let it go.
 *
 * Flags:
 *   --dry-run             report what would change and write nothing
 *   --replace-originals   also downscale the stored photo to 1600px
 *   --limit=N             stop after N photos
 *
 * `--replace-originals` is the destructive half and is off by default: it
 * overwrites photos in place, and the resolution it drops is gone. It writes a
 * copy of each original under `backup/` first and refuses to continue if that
 * write fails. Everything the feed needs comes from the default run; the flag
 * only reclaims storage and makes the enlarge dialog quicker.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

const SUPABASE_URL = "https://jtabjndnietpewvknjrm.supabase.co";
const BUCKET = "milk-pictures";

// The same two shapes `src/lib/imageCompression.ts` produces in the browser.
// Kept in step by hand: this script runs from Node, where that module's canvas
// has no meaning, and it should run once ever.
const THUMB_MAX_EDGE = 800;
const THUMB_QUALITY = 72;
const FULL_MAX_EDGE = 1600;
const FULL_QUALITY = 82;

// A year. These paths carry a timestamp and are never written twice, so the
// only thing revalidating them buys is a round trip per image per visit.
const CACHE_CONTROL = "31536000";

const BACKUP_DIR = resolve(process.cwd(), "backup", "milk-pictures-originals");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const replaceOriginals = args.includes("--replace-originals");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
      "Take it from Supabase, Project Settings, API, service_role, and pass it for\n" +
      "this one run. Do not put it in .env — nothing else in this app needs it.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Mirrors `thumbnailPath` in `src/lib/imageCompression.ts`. */
const thumbnailPath = (picturePath: string): string => {
  const cut = picturePath.lastIndexOf("/");
  return `${picturePath.slice(0, cut + 1)}thumb_${picturePath.slice(cut + 1)}`;
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;
const kb = (bytes: number) => `${Math.round(bytes / 1024)}KB`;

/**
 * Every photo the app could ask for, from the table rather than the bucket.
 *
 * Listing the bucket would also return the thumbnails this script writes,
 * which makes a second run try to build thumbnails of thumbnails. The rows are
 * the authority on what is actually referenced.
 */
const listPicturePaths = async (): Promise<string[]> => {
  const paths: string[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("milk_tests")
      .select("picture_path")
      .not("picture_path", "is", null)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    paths.push(...data.map((row) => row.picture_path as string));
    if (data.length < pageSize) break;
  }

  // A photo can in principle be referenced twice; only process it once.
  return [...new Set(paths)].filter((p) => !p.includes("/thumb_"));
};

const download = async (path: string): Promise<Buffer> => {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
};

/**
 * `rotate()` with no argument applies the EXIF orientation and drops the tag.
 * Without it every portrait photo comes out on its side, because the pixels in
 * a phone JPEG are usually landscape with a tag saying which way is up.
 */
const render = (input: Buffer, maxEdge: number, quality: number) =>
  sharp(input)
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

const upload = async (path: string, body: Buffer) => {
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    cacheControl: CACHE_CONTROL,
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
};

const hasThumbnail = async (thumbPath: string): Promise<boolean> => {
  const { data } = await supabase.storage
    .from(BUCKET)
    .list(dirname(thumbPath), { search: thumbPath.split("/").pop() });
  return !!data?.length;
};

const main = async () => {
  const paths = await listPicturePaths();
  const targets = limit === Infinity ? paths : paths.slice(0, limit);

  console.log(
    `${paths.length} photo(s) referenced; processing ${targets.length}.` +
      `${dryRun ? "  [dry run - nothing will be written]" : ""}` +
      `${replaceOriginals ? "\n  Originals WILL be downscaled in place (backed up to backup/ first)." : ""}`,
  );

  let done = 0;
  let skipped = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const [index, path] of targets.entries()) {
    const label = `[${index + 1}/${targets.length}] ${path}`;
    const thumbPath = thumbnailPath(path);

    try {
      // Cheap check first: a rerun should cost one listing per photo, not a
      // 3MB download.
      const thumbExists = await hasThumbnail(thumbPath);
      if (thumbExists && !replaceOriginals) {
        console.log(`${label}\n    thumbnail already present, skipping`);
        skipped++;
        continue;
      }

      const original = await download(path);
      bytesBefore += original.byteLength;

      if (!thumbExists) {
        const thumb = await render(original, THUMB_MAX_EDGE, THUMB_QUALITY);
        if (!dryRun) await upload(thumbPath, thumb);
        console.log(`${label}\n    thumbnail ${mb(original.byteLength)} -> ${kb(thumb.byteLength)}`);
        bytesAfter += thumb.byteLength;
      } else {
        console.log(`${label}\n    thumbnail already present`);
      }

      if (replaceOriginals) {
        const full = await render(original, FULL_MAX_EDGE, FULL_QUALITY);

        if (full.byteLength >= original.byteLength) {
          console.log("    original already small enough, left alone");
          bytesAfter += original.byteLength;
        } else if (dryRun) {
          console.log(`    original would go ${mb(original.byteLength)} -> ${mb(full.byteLength)}`);
          bytesAfter += full.byteLength;
        } else {
          // Back up before overwriting. If this throws, the original stays.
          const backupPath = resolve(BACKUP_DIR, path);
          mkdirSync(dirname(backupPath), { recursive: true });
          writeFileSync(backupPath, original);

          await upload(path, full);
          console.log(`    original ${mb(original.byteLength)} -> ${mb(full.byteLength)}`);
          bytesAfter += full.byteLength;
        }
      }

      done++;
    } catch (error) {
      failed++;
      console.error(`${label}\n    FAILED: ${(error as Error).message}`);
    }
  }

  console.log(
    `\nProcessed ${done}, skipped ${skipped}, failed ${failed}.` +
      (bytesBefore ? `\nRead ${mb(bytesBefore)}, wrote ${mb(bytesAfter)}.` : ""),
  );

  if (!dryRun && replaceOriginals) {
    console.log(`Originals backed up under ${BACKUP_DIR}`);
  }
  if (failed) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
