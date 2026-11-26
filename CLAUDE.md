# CLAUDE.md

MilkMeNot: a community site for rating plant-based milks. React 19 + TypeScript
SPA (Vite), Supabase backend, Capacitor for mobile, hosted on Cloudflare Workers.

This file holds only what the code cannot tell you: commands, traps and rules.
The background and incident history live in `docs/` — see the table at the end,
and read the matching file before changing that area.

## Commands

```bash
# Install dependencies. Bun is not optional: predev and prebuild both shell out
# to `bunx tsx`, so an npm-only machine cannot run dev or build.
bun install

# Development server (port 8080, override with PORT)
npm run dev

# Build
npm run build        # Production
npm run build:dev    # Development build with full debugging

# Lint. The script is plain `eslint .` — warnings do not fail it, and neither
# does CI. Only lint-staged applies --max-warnings=0, on staged files.
npm run lint

# Type check — build mode, NOT `tsc --noEmit`.
# The root tsconfig is "files": [] plus project references, so plain tsc
# resolves zero files and passes without checking anything.
bunx tsc --build

# Tests
bunx vitest run      # Run once
bunx vitest          # Watch mode
bunx vitest run src/lib/security.test.ts   # one file
npm run test:e2e     # Playwright, chromium, stubbed backend
npm run test:live    # Playwright against milkmenot.com (read-only)

# Local database. Needs Docker Desktop running.
npx supabase start
npx supabase db reset  # LOCAL rebuild from migrations + seed.sql
npx supabase stop
npx supabase migration list --remote   # what is genuinely pending

# DB types (needs `supabase login`; on Windows use npx.cmd or bunx)
npm run types:gen
```

## Working rules

- **Start every session with `EnterWorktree`.** Several agents work here at
  once; a shared checkout has already lost branches and swept other sessions'
  work into commits. Run `bun install` in a fresh worktree. Check a worktree is
  live with `git rev-parse --git-dir` (a dead one silently falls through to the
  main checkout's `.git`). Exception: tasks about the working copy itself.
  Details: `docs/worktrees-and-branches.md`.
- **Tidying branches:** `git branch --merged` is useless (PRs are
  squash-merged); compare against `headRefOid` from `gh pr list --state merged`.
  Never delete `chore/lockfile-refresh`, `lovable`, or `dependabot/*` with an
  open PR. Run `git status --porcelain` in every worktree before removing it —
  it may hold the only copy of something.
- **`main` is protected.** Everything lands by pull request. Required checks:
  `Lint & Type Check`, `Test`, `Build`, `CodeQL`, `Browser tests`. Auto-merge is
  on for every non-draft PR; stop it with a draft or the `hold` label.
- **`/supabase/`, `/.github/` and `/public/_headers` do not auto-merge** — they
  wait for the `reviewed` label (`owned-paths.yml`, patterns from CODEOWNERS).

## Traps

- **`supabase db reset --remote` drops and rebuilds production** — and so does
  `--linked`, its deprecated v2 spelling. One flag from the safe local command.
  Never type either. Since CLI v3 every `db`/`migration`/`gen types` command
  targets the LOCAL database unless given `--remote`.
- **Never hand-regenerate `package-lock.json`.** CI owns it (Node version in
  `ci.yml`); a different npm writes a different file. See `docs/lockfile.md`.
- **Never write the CI skip marker into a commit message** — GitHub scans the
  whole message, so even discussing it skips the workflows. Write "skip-ci
  marker" in prose. A squash-merge turns a PR body into a commit message too.
- **Lovable edits go to the `lovable` branch, never `main`.** Do not delete that
  branch or point Lovable back at `main`. Fast-forward after a merge:
  `git fetch origin; git push origin origin/main:refs/heads/lovable`.
- **A new table needs its own GRANT** (Supabase stopped auto-granting on
  30 Oct 2026). A local `db reset` will NOT catch a missing one — only
  production fails. Grant only the verbs the table needs:
  ```sql
  grant select on public.your_table to anon;
  grant select, insert, update, delete on public.your_table to authenticated;
  grant select, insert, update, delete on public.your_table to service_role;
  ```
- **RLS is the security control** — check it on every new table. The
  publishable key (`sb_publishable_…`) in
  `src/integrations/supabase/client.ts` is public on purpose and grants only
  `anon`; a `service_role` or `sb_secret_…` key must never be committed.
- **An Edge Function called while signed out needs `verify_jwt = false`.** The
  publishable key goes in `apikey` only and is never sent as a Bearer token, so
  a signed-out `functions.invoke` arrives with no JWT at all — the legacy anon
  JWT used to satisfy the gate by accident. `check-rate-limit` is already
  exempt; `mfa-recover` keeps the gate because it only runs with a session.
- **Do not edit** `src/integrations/supabase/types.ts` (generated) or
  `supabase/migrations/00000000000000_baseline.sql` (generated; the two files
  beside it are hand-written and must survive any regeneration).
- **After merging a migration**, check `migration list --remote` — a function
  missing in production fails softly. `db push` is a deliberate step, never a
  reflex.
- **Keep `@zxing/browser` and `@zxing/library`** — they are iPhone's only
  barcode decoder. `@zxing/browser` must stay ≥ 0.2.1.
- **Mapbox never renders in the Claude Code in-app browser.** Don't debug a
  working map; check in a real browser.
- **No form library.** Forms are `useState` + `validateMilkTestInput`; don't
  revive `ui/form.tsx` from history.
- **Dialogs use `StoryDialog`**, not `DialogContent`. Destructive confirms stay
  `AlertDialog`. The palette has no red; destructive actions use amber.
- **`index.html` must not get a canonical**, and its history patch must stay
  *above* the Counterscale script. See `docs/seo-and-sitemap.md`,
  `docs/analytics.md`.
- **Use `?notrack=1`** before poking at analytics, or you pollute live data.
- **`public/sitemap.xml` is generated and gitignored** — don't commit it.
- **DNS:** mail still runs through IONOS; do not touch DNS records casually.
- **Docker crash dialog:** never click "Reset to factory defaults" — it wipes
  the local Supabase stack. Recipe in `docs/backups.md`.
- **The full backup dump is a credential store** (password hashes, refresh
  tokens): never commit, sync or paste it.
- **The thumbnail backfill** (`scripts/backfill-image-thumbnails.ts`) takes the
  service-role key for one run only — never put it in `.env` or `.env.example`.
  Its `--replace-originals` flag overwrites other people's photos for good. See
  `docs/feed-photos.md`.

## Where things live

- `src/pages/` routes (all lazy-loaded in `src/App.tsx`), `src/components/`
  (`ui/` is shadcn), `src/hooks/`, `src/contexts/`, `src/lib/`,
  `src/integrations/supabase/`, `src/types/`. Import with `@/*` → `src/*`.
- Tailwind **v4**: no `tailwind.config.ts`; theme is the `@theme` block in
  `src/index.css`.
- Results-page filter hooks are in `src/hooks/useResultsState.ts`.
- Unit tests sit beside the source (`src/**/*.test.ts[x]`, vitest + jsdom);
  browser tests in `e2e/`, live smoke tests in `e2e-live/`.
- Edge Functions in `supabase/functions/`, migrations in `supabase/migrations/`,
  seed data in `supabase/seed.sql`.
- Workflows in `.github/workflows/`; deploy is `deploy.yml` →
  `bunx wrangler@4 deploy` on every push to `main`.
- The app reads two env vars, both inlined at build time: `VITE_MAPBOX_PUBLIC_KEY`
  and `VITE_SENTRY_DSN` (error reporting; inert when absent).

## Read before changing

| Read this | Before touching |
|-----------|-----------------|
| [docs/architecture.md](docs/architecture.md) | libraries, barcode scanning, dialogs, styling, test setup |
| [docs/worktrees-and-branches.md](docs/worktrees-and-branches.md) | worktrees, branch cleanup |
| [docs/world-map.md](docs/world-map.md) | `MapboxWorldMap.tsx` (zoom, atmosphere, popup names) |
| [docs/feed-photos.md](docs/feed-photos.md) | photo upload, thumbnails, `FeedImage`, the backfill and prune scripts |
| [docs/browser-tests.md](docs/browser-tests.md) | `e2e/`, `e2e-live/`, the backend stub |
| [docs/ci-workflows.md](docs/ci-workflows.md) | any file in `.github/workflows/` |
| [Pipeline overview](https://claude.ai/artifact/TfdN6vrUXVtTKSt5hBvhG1) (plain-language claude.ai artifact; update it too) | checks, owned paths, watchers, deploy, the manual database push |
| [docs/merging-and-protection.md](docs/merging-and-protection.md) | auto-merge, owned paths, rulesets |
| [docs/lockfile.md](docs/lockfile.md) | the lockfile job or its GitHub App |
| [docs/deployment.md](docs/deployment.md) | Cloudflare deploy, `version.json`, the update banner |
| [docs/seo-and-sitemap.md](docs/seo-and-sitemap.md) | `routeHeads`, `STATIC_SEO`, the sitemap script |
| [docs/analytics.md](docs/analytics.md) | Counterscale, the history patch in `index.html` |
| [docs/error-handling.md](docs/error-handling.md) | `ErrorBoundary`, error reporting |
| [docs/lovable.md](docs/lovable.md) | the Lovable sync |
| [docs/supabase.md](docs/supabase.md) | migrations, grants, RLS, the local database |
| [docs/backups.md](docs/backups.md) | the backup scripts, Docker start failures |
