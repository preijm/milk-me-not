# Supabase

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Supabase
- DB types are auto-generated at `src/integrations/supabase/types.ts` — do not edit
  manually. Regenerate with `npm run types:gen`, which needs `supabase login`
  first. On Windows PowerShell, `npx` may be blocked by the execution policy;
  `npx.cmd` or `bunx` get around it without changing any machine settings.
- Edge Functions live under `supabase/functions/` (e.g., `check-rate-limit`)
- Migrations in `supabase/migrations/`

## The Supabase anon key is public on purpose
`src/integrations/supabase/client.ts` has the project URL and anon key written
into it, and they ship in the bundle to every visitor. The same key sits in
older commits of `.env`, which looks alarming and is not: it is the same value
the website already serves, and it carries `"role":"anon"`.

Rotating it would sign every user out and buy nothing. What actually protects
the data is RLS — every table has it enabled, and every write policy carries a
real condition (`auth.uid() = user_id`, `is_admin()`, or `TO service_role`).
Treat RLS as the control, and check it whenever a table is added.

A `service_role` key would be a different matter entirely. None has ever been
committed; keep it that way.

`.env` is gitignored and untracked. `.env.example` carries the names. The only
variable the app actually reads is `VITE_MAPBOX_PUBLIC_KEY` — without it the
map renders its "not configured" state and everything else works.

## The migrations start from a baseline, and three of them are load-bearing
`supabase/migrations/` was 94 files that could not rebuild anything: ten tables
the app reads were never created by any of them, 24 were skipped outright by
the CLI for not matching its `<timestamp>_name.sql` filename format, and 55
more duplicated changes the Lovable dashboard had already applied a second
earlier under a different version. It is now a schema dump of the deployed
database plus what came after.

`00000000000000_baseline.sql` is generated, not written. Do not hand-edit it;
regenerate it if it ever needs to change.

The two files beside it exist because a `--schema public` dump cannot carry
them, and both fail in ways that look fine until they don't:

- **`00000000000001_auth_user_triggers.sql`** — `on_auth_user_created` and
  `on_auth_user_created_assign_role` live on `auth.users`, outside the dumped
  schema. Without them a rebuilt database is healthy until someone signs up
  and gets an account with no profile row and no role.
- **`00000000000002_storage_buckets_and_policies.sql`** — the buckets and
  their eight policies live in `storage`, and buckets are *rows*, so not even
  a `storage` dump would carry them. The app runs until the first upload.

If you ever regenerate the baseline, those two still have to be written by
hand. A dump will not remind you.

## A new table needs its own GRANT, from 30 October 2026
Supabase stops automatically granting Data API access to new tables in `public`
on that date. Nothing already here breaks, and that is not luck: the baseline
dump writes the grants out per table — nineteen tables and four views, each to
`anon`, `authenticated` and `service_role` — rather than leaning on the
automatic one, so a rebuilt database still answers. They are easy to miss when
looking, because pg_dump spells the privilege list out in full instead of
writing `GRANT ALL`.

The two migrations that create a table are both already fine, for different
reasons. `countries` carries no grants of its own and needs none: the baseline
created *and* granted it first, so that `CREATE TABLE IF NOT EXISTS` is a no-op
on a rebuild. `product_barcodes` revokes them on purpose and is reached only
through two `SECURITY DEFINER` functions, and function grants are not part of
this change.

What it costs is three lines in every migration from here that creates a table:

```sql
grant select on public.your_table to anon;
grant select, insert, update, delete on public.your_table to authenticated;
grant select, insert, update, delete on public.your_table to service_role;
```

Grant the verbs the table actually needs — a read-only reference table wants
`select` and nothing else. The grant is not a second RLS: RLS still decides who
sees which rows, while the grant only decides whether PostgREST will look at
the table at all.

**A local `db reset` will not catch a missing one.** The baseline ends with four
`ALTER DEFAULT PRIVILEGES ... ON TABLES` statements, so a rebuilt database
restores the automatic grant for everything created after it and the new table
works. Production never re-runs the baseline, so the same migration lands there
with no grant and the table answers `permission denied` — failing only in the
one place nobody tested, which is exactly how barcode scanning shipped broken.
Those four lines stay where they are: the baseline is generated, not
hand-edited.

## The local database is real, and worth using
`supabase start` builds the whole schema from the baseline and seeds it, which
means policy and migration changes can be tried against a throwaway database
before they reach production. It needs Docker Desktop running.

```bash
npx supabase start     # first run pulls images, several minutes
npx supabase db reset  # rebuild from migrations + seed.sql
npx supabase stop      # snapshots on exit, so the next start is fast
```

`supabase db reset` **resets the local database**. `supabase db reset --remote`
drops and rebuilds *production*, and so does `--linked`, the spelling v2 used
and v3 still accepts. One flag apart; never type either.

Since Supabase CLI v3 every database command (`db dump`, `db push`, `db reset`,
`migration list`, `gen types`) targets the **local** database unless it is
given `--remote`. A bare `npx supabase db push` no longer reaches production: it
fails without a local stack, and with one it "succeeds" against local while
production never gets the migration. `functions deploy` and `delete` still go
to the linked project. `npx supabase` is not pinned and fetches the latest CLI;
only the backup script pins a version (`scripts/backup-supabase.ps1`).

`supabase/seed.sql` holds the country list — 257 ISO regions, minus entries
that are not places (European Union, Eurozone, pseudo-locales) and minus
withdrawn codes that CLDR still resolves to a successor, which would otherwise
list a dozen countries twice and let someone file a rating from East Germany.
It is reference data only; user data never belongs in this repo.

## Migration state is honest now, so trust `migration list`
Local and remote were once 58 files apart, which made `supabase db push`
genuinely dangerous — it would have re-run 55 already-applied migrations, many
of them bare `CREATE TABLE` and `DROP POLICY`. They now match exactly.

```bash
npx supabase migration list --remote   # what is pending, truthfully
npx supabase db push --remote          # applies only what is genuinely new
```

That gap is also how barcode scanning shipped broken: `ScanFlow.tsx` called
`get_product_by_barcode` for weeks while the function did not exist in
production. The call failed softly, so nothing looked wrong. Check this after
merging anything with a migration in it.

A merge that touches `supabase/migrations/` or `supabase/functions/` now opens
a `database` issue with the exact commands to run
(`.github/workflows/database-reminder.yml`). It does not apply anything and
does not close itself: close it once `migration list --remote` matches.



## Database tests
`supabase/tests/*.test.sql` are pgTAP tests, each in a transaction that rolls
back. Run them against the local stack with `npx supabase test db` after
`npx supabase migration up` (or a `db reset`). CI has no database, so nothing
runs them for you: run them when you touch the functions they cover.

## MFA recovery codes are peppered
`hash_mfa_recovery_code` is an HMAC keyed with `mfa_recovery_code_pepper`
from Supabase Vault, which its migration generates inside the database. Vault
stays out of `db dump` and is ciphertext in a raw `pg_dump`, so a leaked
`mfa_recovery_codes` table cannot be cracked offline. Never rotate or delete
that secret casually: every recovery code dies with it.

## Recovery attempts are limited
`mfa-recover` calls `redeem_mfa_recovery_code`, which allows five wrong codes
per account per rolling hour (`mfa_recovery_failures`) and answers 429 after
that, even to a right code. The `check-rate-limit` Edge Function is a different
thing and does nothing today: the `check_rate_limit` SQL function it calls was
never created, so it fails open.
