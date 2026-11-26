# Backups

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Backups, because the Free plan has none
`scripts/backup-supabase.ps1` runs weekly (Mondays 12:00) through Task
Scheduler, registered by `scripts/register-backup-task.ps1`. It was monthly
until 25 Nov 2026; a week is now the most rating data that can be lost. Two dumps, deliberately kept apart:

- **community** — public schema only, minus the tables in `$CommunityExclude`.
  No auth, no credentials, no secrets, no addresses. It is not only what the
  site shows, though: it holds notification inboxes, the newsletter opt-in and
  default countries. Goes to OneDrive, so it survives the laptop.
- **full** — everything including `auth`: bcrypt hashes, live refresh tokens
  and the MFA recovery code hashes. Stays on the machine. Treat it as a
  credential store; never commit it, never sync it, never paste it anywhere.

**A new `public` table goes into the synced dump by default.** That is how
`mfa_recovery_codes` got there: from 6 Oct to 26 Nov 2026 the community dump
carried its hashes. They were unsalted SHA-256 of 48-bit codes, so one GPU
sweep of 2^48 cracks every row at once in hours, and a cracked code (with the
password) removes the authenticator. It and `security_log` (admin-only, has
IP and user-agent columns) are now passed to `db dump` as `-x`. Any new table
with secrets in it goes on that list in the same pull request.

Since `20261126130000_pepper_mfa_recovery_codes.sql` the hashes are an HMAC
keyed with a pepper in Supabase Vault, and every set hashed the old way was
deleted. `db dump` leaves the `vault` schema out entirely, and even a raw
`pg_dump` of `vault.secrets` is ciphertext whose key lives on the database
server's filesystem, so neither dump can crack them any more. The table stays
on the `-x` list anyway.

The irreplaceable half is the community data. Accounts can be recreated; other
people's ratings cannot.

The task runs only while signed in — storing a Windows password with it is not
a trade worth making — so `backup.log` beside the full dump records each run.

**Changing the schedule or the scripts' location needs a re-register.** Task
Scheduler stores the command line, not the script, so after pulling a change to
the schedule run `scripts/register-backup-task.ps1` once from the **main
checkout** (never a worktree: the path it registers must outlive the session).
It removes the old monthly task if it is still there.

### The heartbeat, so a silent stop is noticed
Everything above lives on the laptop, so a laptop that is off, signed out or
gone stops the backup *and* the thing watching it, and nobody hears. So after
the community dump succeeds the script sets the repository variable
`LAST_BACKUP_AT` (UTC, ISO 8601) with `gh variable set` — `gh` is already
signed in here, and the variable holds a timestamp and nothing else, so no
database credential goes anywhere near CI.

`.github/workflows/backup-heartbeat.yml` reads it daily and opens an issue
labelled `backup` when it is missing or older than ten days, and closes it once
a fresh one appears. See `ci-workflows.md`.

Recording the heartbeat never fails the backup. If `gh` is missing or signed
out, the log gets a `WARN  Heartbeat not recorded: ...` line and the run still
finishes; the GitHub issue then fires even though the dump is fine, and that
line is what tells the two apart. `gh auth status` fixes it.

Check it by hand with `gh variable get LAST_BACKUP_AT`.

Retention is asymmetric, and deliberately so: `-KeepCommunity` holds twelve
months (52 weekly dumps), `-KeepFull` holds three (13). A year of ratings is the thing worth having a
year of, while an old full dump is a year-old credential store carrying bcrypt
hashes and refresh tokens that recover nothing the newest one cannot. Pruning
runs only after a dump succeeds, so a failed week never deletes the copy it
failed to replace. The counts were 12 and 3 while the backup was monthly; a
schedule change has to change them with it.

`check-backup-health.ps1` reads that log weekly, half an hour after the
backup, and interrupts you when something is wrong; past ten days without a
dump counts as stale, the same threshold as the GitHub watcher. It asks Task Scheduler what the task actually did rather
than inferring it from the age of a dump: "may not be running" used to be
appended to every stale-backup warning, and on 23 Nov 2026 it was wrong —
the task had fired on 1 Oct and 1 Nov exactly on time and failed both times.

### When the backup cannot start Docker
The dumps shell `pg_dump` into a container, so the script needs Docker and
starts Docker Desktop itself when it is down. Two separate things have broken
that, and they look alike in `backup.log` until you read the timestamps.

**A failure two seconds in, quoting docker's own connection error, is the
script.** That was a `docker info *> $null` whose redirected stderr became a
terminating error under `ErrorActionPreference = "Stop"`, so the check threw
instead of returning false and the auto-start below it was unreachable. Fixed
by `Test-DockerReady`; the trap is written out beside it, and in `Invoke-Dump`,
which met the same thing first. A real Docker problem reads `Docker did not
become ready within five minutes` instead, five minutes in.

**Docker Desktop refusing to start at all is the socket trap.** It binds
AF_UNIX sockets and removes the previous one first, and on this machine Windows
cannot remove them: every API answers error 1920, "The file cannot be accessed
by the system." So one unclean shutdown leaves a file no later start can clear,
and Docker crashes on boot from then on. On 23 Nov 2026 the leftovers were
dated 23 Aug and the backups had been failing since 1 Oct.

Three things that cost an afternoon:

- **There are two locations, and both must be clean at once.** Clearing
  `%LOCALAPPDATA%\Docker\run` only moved the crash from the Ingest server to
  the Secrets Engine in `%LOCALAPPDATA%\docker-secrets-engine`.
- **Renaming the directory aside is the only removal that works**, because it
  never opens the files inside. `Remove-Item`, `[System.IO.File]::Delete`,
  `fsutil`, `cmd rd`, `rm -rf` from WSL and `robocopy /MIR` all fail with the
  same 1920 — the last of those is worth knowing because a mirror from an empty
  directory is the usual answer to a file Windows will not delete, and here it
  reports the socket and leaves it. The renamed folders cannot be deleted
  afterwards either, and **a reboot does not free them**: retried on 24 Nov 2026
  on a machine fifteen minutes up, with the same error from every method. They
  are inert and hold nothing — one 0-byte socket each — and Docker ignores them,
  so leave them rather than spending the afternoon again.
- **A clean `docker desktop stop` is not reliable cleanup.** It removed the
  sockets once and left all five behind on the next stop an hour later.

So the recipe, when the crash dialog appears or the log says Docker never
became ready:

```powershell
# quit Docker first - Stop-Process on com.docker.* and "Docker Desktop" will do
wsl --shutdown
Rename-Item "$env:LOCALAPPDATA\Docker\run" "run.stale"
Rename-Item "$env:LOCALAPPDATA\docker-secrets-engine" "docker-secrets-engine.stale"
```

Then start Docker Desktop. It recreates both directories and comes up in about
thirty seconds from cold.

**Do not click "Reset to factory defaults" on that dialog.** It sits right
beside Quit, and it discards the local Supabase stack along with every other
image and volume. Nothing above needs it.

## Restoring: what to do when something goes badly wrong
Rehearsed on the **local** stack on 26 Nov 2026 with that morning's dumps.
Every command below that loads data was run as written against
`npx supabase start`, and the row counts of all twenty `public` tables came out
identical to production's. The hosted half (a new Supabase project, pointing
the site at it) has **not** been practised. It is written from what the
rehearsal showed, and says so where it is guesswork.

First decide which case it is. They need very different things, and the heavy
one is the rarest.

| What happened | Data lost | Go to |
|---|---|---|
| A deploy broke the site, the database is fine | none | 1 |
| Rows deleted or overwritten in the live project | only the damaged rows | 2 |
| The Supabase project is gone (deleted, locked, unrecoverable) | up to a week | 3 |

### What every restore leans on
**The dump turns triggers and foreign keys off for itself.** Its first line is
`SET session_replication_role = replica`. That is why loading 373 ratings does
not fire 373 notification triggers, and why the order of tables in the file
does not matter. `postgres` is not a superuser here, and
`has_parameter_privilege` even answers *false* for that setting, locally and in
production. Yet the `SET` works locally, because Supabase's `supautils` lets
`postgres` set it. Hosted projects run the same extension, so it should work
there too; that part is not proven.

**So every load uses both of these flags, without exception:**

```bash
psql ... -v ON_ERROR_STOP=1 --single-transaction
```

Without them, a refused `SET` is just a printed error. psql carries on with the
triggers live, the signup trigger writes duplicate profiles, and a half-loaded
database is left behind. With them, any error rolls the whole load back.

**There is no `psql` on the laptop.** Use the one inside the local database
container. It reads a dump from stdin, and it can reach a hosted database when
given a connection string:

```bash
docker exec -i supabase_db_jtabjndnietpewvknjrm psql -U postgres ...             # local
docker exec -i supabase_db_jtabjndnietpewvknjrm psql "<connection string>" ...   # hosted
```

The hosted connection string is in the dashboard under Connect → Session
pooler (port 5432). The transaction pooler on 6543 cannot hold a session
setting. The string carries the database password, so type it and never save
it in a file.

**Never truncate a live project to reload it.** Emptying `public` and loading
the whole dump is right only for a database that holds nothing worth keeping:
the local stack, or a brand-new project. On the live one it throws away
everything since Monday.

### 1. A bad change: roll the deploy back
The site is static files on a Cloudflare Worker, so the last good version is
still there:

```bash
bunx wrangler@4 deployments list     # find the last good version
bunx wrangler@4 rollback             # back to the previous one (or pass a version id)
```

The Cloudflare dashboard does the same under Workers → `milk-me-not` →
Deployments. Then **revert the PR on GitHub as well**. The next push to `main`
deploys again, and would bring the bad change straight back.

A rollback does not touch the database. A bad *migration* is undone by a new
migration that reverses it (`/supabase/` waits for the `reviewed` label), not
by a restore. If it destroyed rows, it is also case 2.

### 2. Data damaged in the live project
Bring back only the damaged rows, from the newest dump taken *before* the
damage. Accounts are untouched, so the community dump is enough.

**a. Load the dump into the local stack.** This wipes local, which is fine.

```bash
npx supabase start
npx supabase db reset      # LOCAL. Never with --remote or --linked.
```

```bash
# Empty every public table first, so the seed's countries do not collide with the dump's.
cat > /tmp/truncate.sql <<'SQL'
DO $$ DECLARE t text; BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') INTO t
  FROM pg_tables WHERE schemaname = 'public';
  EXECUTE 'TRUNCATE ' || t || ' RESTART IDENTITY CASCADE';
END $$;
SQL

cat /tmp/truncate.sql "$OneDrive/Projects/Milk Me Not/Backups/community-data-YYYYMMDD.sql" |
  docker exec -i supabase_db_jtabjndnietpewvknjrm psql -U postgres -v ON_ERROR_STOP=1 --single-transaction -q
```

Without the truncate the load fails on `countries_code_key`, because
`seed.sql` has already put the same 257 countries there. Every rating will
point at a user that does not exist locally. That is expected: foreign keys
are off.

Before going further, check this is the right moment: look at the rows in
Studio (`http://127.0.0.1:54323`).

**b. Export the damaged table from local**, as inserts:

```bash
docker exec supabase_db_jtabjndnietpewvknjrm pg_dump -U postgres --data-only \
  --table=public.milk_tests --column-inserts --rows-per-insert=100 \
  --on-conflict-do-nothing > milk_tests_rows.sql
```

**c1. Rows were deleted.** Put back the missing ones and leave the rest alone:

```bash
( echo "SET session_replication_role = replica;"; cat milk_tests_rows.sql ) |
  docker exec -i supabase_db_jtabjndnietpewvknjrm psql "<connection string>" -v ON_ERROR_STOP=1 --single-transaction -q
```

Rehearsed by deleting ten ratings locally: they came back, and the
notification count did not move. `--on-conflict-do-nothing` skips every row
that still exists, which is exactly why it cannot repair a row whose *values*
were damaged.

**c2. Rows were overwritten.** Go through a staging table, and replace only
the rows that differ from the dump. Export without `--on-conflict-do-nothing`
this time, then:

```bash
( echo "create schema restore_staging;
        create table restore_staging.milk_tests (like public.milk_tests);"
  sed 's/^INSERT INTO public\.milk_tests /INSERT INTO restore_staging.milk_tests /' milk_tests_rows.sql
  echo "set session_replication_role = replica;
        delete from public.milk_tests t using restore_staging.milk_tests s
          where t.id = s.id and t is distinct from s;   -- narrow this to the damaged rows
        insert into public.milk_tests select s.* from restore_staging.milk_tests s
          where not exists (select 1 from public.milk_tests t where t.id = s.id);
        drop schema restore_staging cascade;" ) |
  docker exec -i supabase_db_jtabjndnietpewvknjrm psql "<connection string>" -v ON_ERROR_STOP=1 --single-transaction
```

Rehearsed by overwriting 25 ratings locally. Afterwards the table's checksum
matched the one from before the damage exactly. **Narrow the `where`** to the
rows you know were damaged: as written, it also reverts every honest edit made
since the dump. Replica mode also stops `ON DELETE CASCADE`, so the delete
cannot take child rows with it.

Afterwards, delete `milk_tests_rows.sql` and run `npx supabase db reset` on
the local stack. The dump's ratings do not belong in it.

### 3. The project is gone: a new Supabase project
This is the full restore. It needs **the full dump from the laptop**, not just
the community one. The rehearsal settled why:

- With the community dump alone the site *works*. The feed answers, and
  products and ratings show with their usernames. But all 21 accounts are
  gone, and every one of the 373 ratings belongs to a user id nobody can sign
  in as.
- Members cannot simply sign up again. A signup with their old username fails
  on `profiles_username_unique` (rehearsed: the signup is refused). With a new
  username it works, but the new account gets a new id and owns none of the
  old ratings. Re-linking them means `update ... set user_id = <new> where
  user_id = <old>` per person, across every table with a `user_id`. Matching
  old to new needs the email addresses, which only the full dump holds.

So if the laptop is lost **as well**, the community data comes back and the
accounts do not. Plan on a manual re-link for anyone who asks.

**a. Create the project and its schema.** Make a new project in the Supabase
dashboard, in the same region if possible. Then, from the **main checkout**:

```bash
npx supabase link --project-ref <new-ref>
npx supabase migration list --remote     # everything pending
npx supabase db push --remote            # schema, grants, auth triggers, buckets, policies
npx supabase functions deploy check-rate-limit
npx supabase functions deploy mfa-recover
```

Both functions read only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which
every project provides itself. `db push` also creates a fresh recovery code
pepper in the new project's Vault, so **every MFA recovery code from the old
project is dead** after this restore: the dump carries the hashes but not the
key. That is intended. Members who use two-step sign-in keep their
authenticator and see "Make recovery codes" in Settings; tell them to make a
new set. Relinking the main checkout also matters for the
backups: until it is done, the Monday job keeps dumping a project that no
longer exists.

**b. Load the full dump**, streamed from where it lives. It is a credential
store, so never copy it anywhere to do this. Leave its `storage.*` inserts out.
The bucket rows collide with the ones the migration just created, and Storage
refuses a direct delete ("Direct deletion from storage tables is not
allowed"). The object rows come back when the photos are uploaded (step e).

```bash
F=$(ls -t "$USERPROFILE"/Backups/milk-me-not/full-data-*.sql | head -1)
sed '/^INSERT INTO "storage"\./,/^$/d' "$F" |
  docker exec -i supabase_db_jtabjndnietpewvknjrm psql "<new connection string>" -v ON_ERROR_STOP=1 --single-transaction -q
```

`db push` does not run `seed.sql`, so the new project's `countries` should be
empty and no truncate is needed. If the load stops on `countries_code_key`,
put `/tmp/truncate.sql` from 2a in front, as in the local rehearsal. That
rehearsal (truncate, then this exact `sed` and load) gave 21 users, 22
identities, every `public` count identical to production and zero ratings
without a user, and the local Auth service listed all 21 accounts. Check the
same on the new project:

```sql
select count(*) from auth.users;   -- 21 in Nov 2026
select count(*) from public.milk_tests m
  where not exists (select 1 from auth.users u where u.id = m.user_id);   -- must be 0
```

What it means for members: **everyone is signed out**, because the new project
has a new JWT secret, so every restored session and refresh token is dead.
**Passwords still work**, because the bcrypt hashes come across unchanged. The
one TOTP factor is restored too; whether it still verifies on a new project was
not tested.

**c. Settings the dump does not carry.** None of these is in a dump or in the
repo, so set them by hand in the new project's dashboard:

- Authentication → URL configuration: site URL `https://milkmenot.com` and the
  redirect URLs.
- Authentication → Providers → Google. In the Google Cloud console, update the
  OAuth client's authorised redirect URI too, because it names the project
  (`https://<new-ref>.supabase.co/auth/v1/callback`). Two members sign in with
  Google.
- Email: SMTP settings and templates, if they were customised.
- MFA settings, rate limits, and anything else changed from the defaults.

**d. Point the code at the new project.** The project ref
`jtabjndnietpewvknjrm` is written into more places than `client.ts`, and every
one of them has to change:

| File | What breaks if missed |
|---|---|
| `src/integrations/supabase/client.ts` | URL **and** anon key: everything |
| `src/components/feed/FeedImage.tsx` | every feed photo |
| `public/_headers` (CSP) | the browser blocks every call to the new host. Owned path: waits for `reviewed` |
| `index.html` | the preconnect only, so a slower first load |
| `supabase/config.toml` | `project_id`. Owned path |
| `package.json` (`types:gen`) | type generation reads the old project |
| `scripts/backfill-image-thumbnails.ts`, `scripts/prune-orphan-photos.ts` | they write to the old project |
| `e2e/support/backend.ts` | the browser tests stub the wrong host |

`git grep jtabjndnietpewvknjrm` finds them all. One URL also sits **in the
data**: a profile's avatar is stored as a full URL. After the load:

```sql
update public.profiles
  set avatar_url = replace(avatar_url, 'jtabjndnietpewvknjrm', '<new-ref>')
  where avatar_url like '%jtabjndnietpewvknjrm%';
```

Ratings store `picture_path`, not a URL, so they need nothing.

**e. Photos**, only if a copy of the buckets exists (see below). They have to
go back through the Storage API, with the service role key for that one run,
not into `storage.objects`, so that the rows and the files agree. Keep every
path exactly as it was, `thumb_` copies included.

### Photos are not backed up
**Nothing backs up the files in Storage.** The dumps hold the database only.
`storage.objects` is a table of *pointers*; the bytes live outside Postgres.
The Free plan has no backups of its own, and Supabase's paid backups do not
include Storage files either. So today a lost project loses every photo for
good, whichever dump survives.

On 26 Nov 2026 that was 220 files, about 43 MB:

| Bucket | Files | Size |
|---|---|---|
| `milk-pictures` | 218 (photos and their `thumb_` copies) | 41 MB |
| `avatars` | 1 | 1.6 MB |
| `logos` | 1 | 63 KB |

The ratings still restore without them. `FeedImage` falls back and fails
quietly, so a rating whose photo is lost shows without one.

**Proposal, not built:** a third step in `backup-supabase.ps1`, after the
community dump, that mirrors the buckets into
`%OneDrive%\Projects\Milk Me Not\Backups\photos\<bucket>\<path>`.

- **It needs no new credential.** All three buckets are public, so every file
  downloads from `/storage/v1/object/public/<bucket>/<path>` with nothing but
  a URL. The paths come from the community dump the same run just wrote
  (`milk_tests.picture_path`, the same name with `thumb_` in front, and
  `profiles.avatar_url`), so there is no listing API and no service role key.
  Reading paths from the ratings also skips orphan uploads, which nobody needs
  back.
- **It is incremental by nature.** Paths carry a timestamp and are never
  rewritten (see `feed-photos.md`), so a file already in the mirror never has
  to be fetched again. The first run is about 43 MB; a normal week is a few
  photos.
- **It is safe to sync.** These are photos the site already shows to anyone,
  the same standing as the community dump. Never prune the mirror against the
  ratings: a deleted rating is exactly when the photo is wanted back.
- **Restoring** is a small script beside the backfill that uploads the mirror
  with the service role key for one run, keeping each path.
- The `logos` file is not referenced from any table; copy it once by hand.

The alternative is Storage's S3 endpoint with `rclone sync`. It mirrors every
object without a path list, but needs S3 access keys stored on the laptop: a
credential, for no gain over public URLs.

