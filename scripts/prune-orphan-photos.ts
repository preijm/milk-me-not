/**
 * Delete the photos in `milk-pictures` that no `milk_tests` row points at.
 *
 * The bucket accumulates uploads that never became a rating: the file is
 * written first and the row inserted afterwards, so an abandoned submit — or a
 * double-tap when the first insert was slow — leaves a 3MB photo behind that
 * nothing will ever request. Eight of them were sitting there from July 2025,
 * two of the pairs byte-identical and ten seconds apart.
 *
 * They cost no egress, because no page asks for them. This only reclaims
 * storage, so there is no hurry, and every default here errs towards doing
 * nothing.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... bunx tsx scripts/prune-orphan-photos.ts
 *
 * That reports and writes nothing. **A dry run is the default**, the opposite
 * of `backfill-image-thumbnails.ts`, because the worst a missing thumbnail
 * causes is a slow feed and the worst a wrong deletion causes is somebody
 * else's photo being gone. Read the list, then pass `--delete`.
 *
 * It needs the service role key for two separate reasons, and the first is the
 * one that matters: RLS on `milk_tests` only lets an authenticated user select,
 * and `get_all_milk_tests` — the only public way in — filters
 * `is_hidden_from_feed = false`. Read the table through anything less than the
 * service role and a hidden rating's photo looks unreferenced. It is also what
 * lets a delete touch a folder that is not its own.
 *
 * Flags:
 *   --delete              actually remove them; without it nothing is written
 *   --min-age-days=N      never touch anything newer (default 7)
 *   --limit=N             stop after N orphans
 *   --force               proceed past the "too many orphans" refusal
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

// Imported rather than copied, unlike in the backfill. That script's own copy
// costs a redundant thumbnail if it ever drifts; a wrong answer here deletes
// the live thumbnail of a photo that is still on the feed. Nothing in this
// module runs at import time, and its canvas work stays inside functions this
// script never calls.
import { thumbnailPath } from "../src/lib/imageCompression";

const SUPABASE_URL = "https://jtabjndnietpewvknjrm.supabase.co";
const BUCKET = "milk-pictures";

const BACKUP_DIR = resolve(process.cwd(), "backup", "milk-pictures-orphans");

/**
 * An orphan younger than this is assumed to be an upload in flight.
 *
 * The upload finishes before the insert does, so between the two there is a
 * real window in which a photo somebody is posting right now is referenced by
 * nothing. A week is far longer than that window and costs nothing to wait.
 */
const DEFAULT_MIN_AGE_DAYS = 7;

/**
 * Refuse to delete more than this share of the bucket without `--force`.
 *
 * The failure this catches is a read that half-worked: a paging bug or a
 * changed policy that returns ten rows instead of a hundred marks almost
 * everything an orphan, and every other check below still passes. A run that
 * wants to delete most of the photos is wrong until proven otherwise.
 */
const MAX_ORPHAN_SHARE = 0.25;

const args = process.argv.slice(2);
const doDelete = args.includes("--delete");
const force = args.includes("--force");

const numeric = (flag: string, fallback: number) => {
  const found = args.find((a) => a.startsWith(`${flag}=`));
  return found ? Number(found.split("=")[1]) : fallback;
};
const minAgeDays = numeric("--min-age-days", DEFAULT_MIN_AGE_DAYS);
const limit = numeric("--limit", Infinity);

if (!Number.isFinite(minAgeDays) || minAgeDays < 0) {
  console.error("--min-age-days must be a non-negative number.");
  process.exit(1);
}

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

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

interface StoredObject {
  path: string;
  size: number;
  createdAt: string;
}

/**
 * Every path any row refers to, plus the thumbnail that belongs to it.
 *
 * No `is_hidden_from_feed` filter and no join: a rating hidden from the feed is
 * still a rating, and its photo is not an orphan.
 */
const referencedPaths = async (): Promise<Set<string>> => {
  const paths = new Set<string>();
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("milk_tests")
      .select("picture_path")
      .not("picture_path", "is", null)
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      const path = row.picture_path as string;
      paths.add(path);
      paths.add(thumbnailPath(path));
    }
    if (data.length < pageSize) break;
  }

  return paths;
};

const listFolder = async (prefix: string): Promise<StoredObject[]> => {
  const found: StoredObject[] = [];
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: pageSize, offset });

    if (error) throw error;
    if (!data?.length) break;

    for (const entry of data) {
      // A folder comes back with null metadata, and Supabase's own
      // `.emptyFolderPlaceholder` is not anybody's photo. Neither is ours.
      if (!entry.metadata) continue;
      if (entry.name.startsWith(".")) continue;

      found.push({
        path: prefix ? `${prefix}/${entry.name}` : entry.name,
        size: Number(entry.metadata.size ?? 0),
        createdAt: entry.created_at ?? "",
      });
    }

    if (data.length < pageSize) break;
  }

  return found;
};

/**
 * Everything in the bucket. One folder per uploader, one level deep — the
 * insert policy ends with `array_length(storage.foldername(name), 1) = 1`, so
 * there is nowhere else an object can be.
 */
const listBucket = async (): Promise<StoredObject[]> => {
  const { data: folders, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (error) throw error;

  const objects: StoredObject[] = [];
  for (const folder of folders ?? []) {
    if (folder.metadata) continue; // an object at the root, not a folder
    objects.push(...(await listFolder(folder.name)));
  }
  return objects;
};

const backUp = async (object: StoredObject) => {
  const { data, error } = await supabase.storage.from(BUCKET).download(object.path);
  if (error) throw error;

  const target = resolve(BACKUP_DIR, object.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(await data.arrayBuffer()));
};

const main = async () => {
  const referenced = await referencedPaths();
  const objects = await listBucket();

  // A read that returned nothing marks the whole bucket an orphan. Far more
  // likely than every rating having lost its photo.
  if (referenced.size === 0) {
    console.error(
      `Not one of the ${objects.length} object(s) is referenced by a milk_tests row.\n` +
        "That is a broken read, not an empty table. Nothing deleted.",
    );
    process.exit(1);
  }

  const orphans = objects.filter((o) => !referenced.has(o.path));
  const cutoff = Date.now() - minAgeDays * 24 * 60 * 60 * 1000;
  const heldBack = new Set(
    orphans.filter((o) => !o.createdAt || Date.parse(o.createdAt) > cutoff),
  );
  const eligible = orphans
    .filter((o) => !heldBack.has(o))
    .sort((a, b) => a.path.localeCompare(b.path));

  console.log(
    `${objects.length} object(s) in ${BUCKET}, ${referenced.size} referenced by a rating.\n` +
      `${orphans.length} orphan(s), ${heldBack.size} of them newer than ${minAgeDays} day(s).`,
  );

  if (heldBack.size) {
    console.log(
      "  Held back as possibly still uploading:\n" +
        [...heldBack]
          .map((o) => `    ${o.path}  ${o.createdAt.slice(0, 10) || "no date"}`)
          .join("\n"),
    );
  }

  const targets = limit === Infinity ? eligible : eligible.slice(0, limit);
  if (!targets.length) {
    console.log("\nNothing to remove.");
    return;
  }

  const bytes = targets.reduce((sum, o) => sum + o.size, 0);
  console.log(
    `\n${doDelete ? "Deleting" : "Would delete"} ${targets.length} object(s), ${mb(bytes)}:`,
  );
  for (const o of targets) {
    console.log(`    ${mb(o.size).padStart(8)}  ${o.createdAt.slice(0, 10)}  ${o.path}`);
  }

  if (orphans.length > objects.length * MAX_ORPHAN_SHARE && !force) {
    console.error(
      `\n${orphans.length} of ${objects.length} objects look unreferenced — over ` +
        `${Math.round(MAX_ORPHAN_SHARE * 100)}%.\n` +
        "Check the row count above before believing that. Pass --force to proceed.",
    );
    process.exit(1);
  }

  if (!doDelete) {
    console.log("\nDry run. Pass --delete to remove these, --limit=1 to try one first.");
    return;
  }

  let removed = 0;
  let failed = 0;

  for (const [index, object] of targets.entries()) {
    const label = `[${index + 1}/${targets.length}] ${object.path}`;
    try {
      // Back up before removing. If this throws the photo stays where it is,
      // which is the whole point of doing it first.
      await backUp(object);

      const { error } = await supabase.storage.from(BUCKET).remove([object.path]);
      if (error) throw error;

      console.log(`${label}\n    removed, backed up`);
      removed++;
    } catch (error) {
      failed++;
      console.error(`${label}\n    FAILED: ${(error as Error).message}`);
    }
  }

  console.log(`\nRemoved ${removed}, failed ${failed}.`);
  if (removed) console.log(`Copies kept under ${BACKUP_DIR}`);
  if (failed) process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
