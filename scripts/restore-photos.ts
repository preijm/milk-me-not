/**
 * Upload the photo mirror that `backup-supabase.ps1` keeps in OneDrive back
 * into Storage, every file at exactly the path it came from.
 *
 * Only for a restore: a new project after the old one is gone (step 3e of
 * docs/backups.md), or the local stack to rehearse one. Run it once:
 *
 *   $env:SUPABASE_SECRET_KEY="..."; bunx tsx scripts/restore-photos.ts --url=https://<new-ref>.supabase.co
 *
 * It needs a secret key because it writes into every user's folder, and the
 * storage policies only let a user write into their own. Take the key from the
 * dashboard (Project Settings → API Keys → Secret keys), pass it for this one
 * run, and let it go: it never belongs in `.env` or `.env.example`.
 *
 * `SUPABASE_SERVICE_ROLE_KEY` is read as a fallback but was disabled on
 * 2026-11-26 and now answers 401. Use `SUPABASE_SECRET_KEY`. A restored
 * project is a *new* project, so it has its own secret key — take that one.
 *
 * `--url` has no default on purpose. Nothing here should land in a project
 * because it was the one the script happened to name.
 *
 * Going through the Storage API rather than inserting into `storage.objects`
 * is what keeps the rows and the files in agreement. A file already in the
 * bucket is left alone (`upsert: false`), so it is safe to re-run after a
 * partial upload, and it can never overwrite a photo uploaded since.
 *
 * Flags:
 *   --url=<project url>   required, e.g. http://127.0.0.1:54321 for local
 *   --from=<dir>          the mirror; defaults to the OneDrive folder
 *   --dry-run             list what would be uploaded and write nothing
 */
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "fs";
import { extname, join, relative, sep } from "path";

const BUCKETS = ["milk-pictures", "avatars", "logos"];

// The same year the app sets on upload: paths carry a timestamp and are never
// written twice, so there is nothing to revalidate.
const CACHE_CONTROL = "31536000";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".avif": "image/avif",
};

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const dryRun = args.includes("--dry-run");
const url = flag("url");
const from =
  flag("from") ?? join(process.env.OneDrive ?? "", "Projects", "Milk Me Not", "Backups", "photos");

if (!url) {
  console.error("Pass --url=<project url>, e.g. --url=http://127.0.0.1:54321 for the local stack.");
  process.exit(1);
}

// The legacy service-role key was disabled on 2026-11-26 and now answers 401,
// so this fallback no longer gets anyone anything. It stays only so an old
// shell fails on the API call with a clear "Legacy API keys are disabled"
// rather than on a missing-variable check that hides the real reason.
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey && !dryRun) {
  console.error(
    "Set SUPABASE_SECRET_KEY for this one run. Do not put it in .env: nothing else in this app needs it.",
  );
  process.exit(1);
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(full);
    // A .part is a download the backup did not finish; it is not a photo.
    return entry.isFile() && !entry.name.endsWith(".part") ? [full] : [];
  });
}

const supabase = createClient(url, serviceKey ?? "dry-run", {
  auth: { persistSession: false, autoRefreshToken: false },
});

let uploaded = 0;
let skipped = 0;
let failed = 0;

console.log(`${dryRun ? "Dry run: " : ""}restoring ${from} into ${url}`);

for (const bucket of BUCKETS) {
  const dir = join(from, bucket);
  let files: string[];
  try {
    if (!statSync(dir).isDirectory()) continue;
    files = filesUnder(dir);
  } catch {
    console.log(`${bucket}: nothing in the mirror`);
    continue;
  }

  for (const file of files) {
    // The mirror is <bucket>\<path>, so the path is everything below the bucket.
    const path = relative(dir, file).split(sep).join("/");
    if (dryRun) {
      console.log(`would upload ${bucket}/${path}`);
      uploaded++;
      continue;
    }

    const { error } = await supabase.storage.from(bucket).upload(path, readFileSync(file), {
      upsert: false,
      cacheControl: CACHE_CONTROL,
      contentType: CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
    });

    if (!error) {
      uploaded++;
    } else if (/exists/i.test(error.message) || (error as { statusCode?: string }).statusCode === "409") {
      skipped++;
    } else {
      failed++;
      console.error(`${bucket}/${path}: ${error.message}`);
    }
  }
}

console.log(
  `${dryRun ? "Would upload" : "Uploaded"} ${uploaded}, already there ${skipped}, failed ${failed}.`,
);
process.exit(failed ? 1 : 0);
