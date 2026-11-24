# Browser tests and the live smoke test

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Browser tests are separate, and only chromium
`e2e/` holds Playwright specs; `src/**` belongs to vitest, and neither runner
looks at the other's files. They run against `vite preview` serving a real
build, so what is tested is what deploys.

The scanner is the reason they exist. It needs `getUserMedia`, a `<video>` that
carries a stream and a decoder — jsdom has none of those, so no unit test can
tell a working scanner from one reporting "No camera access". Chromium is
started with `--use-fake-device-for-media-stream`, which is also why this works
on a CI runner with no webcam.

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # pick through them interactively
```

Two things the stub in `e2e/support/backend.ts` has to get right, both learned
by getting them wrong:

- **GoTrue returns bare objects**, not `{ data, error }`. A token response
  without an `access_token` sends supabase-js to split a JWT it does not have,
  and the app dies on boot.
- **`.single()` is not a collection.** It asks for
  `application/vnd.pgrst.object+json` and an empty result is a 406 with code
  `PGRST116`, never `[]`. Answering it with an array gave `useVersionCheck` an
  empty array as its version row, and since VersionProvider wraps everything,
  the blank page was the whole site.

**`Browser tests` is a required check**, so a red one blocks the merge like any
other. It was deliberately advisory first: with auto-merge on, a required check
that goes red on a slow runner stops every pull request in the queue, and
browser tests are the flakiest thing in any suite. It was promoted after
running green on every pull request it saw.

Two things keep it from becoming the flaky check that blocks everything. The
suite retries once in CI and nowhere else, so a genuine failure still fails
locally on the first run. And nothing in it waits on live data — every request
is served from a fixture, so there is no network to be slow.

## The live site is smoke-tested in a browser, after every deploy
`e2e-live/` is a second Playwright suite with its own config,
`playwright.live.config.ts`, and it points at **milkmenot.com itself**: no
stubs, no local build. It opens `/`, `/results`, `/brands`, `/about` and one
product page found by clicking through, and fails on an uncaught error, the
`ErrorBoundary` page, an empty `#root`, or a `.js`/`.css` file that 404s.

```bash
npm run test:live    # against production; SITE_URL=... to point elsewhere
```

It exists because there is no error reporting service (see `error-handling.md`), and the
health check only `curl`s the HTML, so a bundle that loads and then throws
looked healthy to everything. Two places run it:

- **`deploy.yml`**, as a last job. It first waits for `version.json` to name
  the commit being deployed, so it never tests the previous build by accident.
  A red Deploy on main becomes an issue through `alert-on-failure.yml`.
- **`health-check.yml`**, every six hours, folded into that workflow's own
  issue rather than failing on its own step.

It is read-only on purpose: no sign-in, no forms, nothing written. And it sets
the Counterscale opt-out (`pco-notrack`) in an init script before any page
runs, so a test visit every deploy and every six hours never shows up as a
visitor. Keep both if you add pages to it.


