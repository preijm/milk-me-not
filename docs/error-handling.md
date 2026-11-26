# Errors in a visitor's browser

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Errors in a visitor's browser
Everything else watches code before it lands or the site after it deploys.
Neither can see a component throwing on a phone in a shop — which is not
hypothetical: a version string arriving as `undefined` got split, the throw went
through every provider, and the page rendered nothing with all checks green.

**`ErrorBoundary`** wraps everything in `main.tsx`, *outside* the providers,
because the crash it exists for came from inside one. It shows a real page with
a reload button instead of white. Built from raw markup rather than the story
components — a boundary that imports half the app can be brought down by the
module it is meant to catch.

**Sentry reports what the boundary catches.** Removed in November 2026 because
no DSN had ever been set, and brought back on 25 November 2026 with one. The
code is `src/lib/errorReporting.ts`: `componentDidCatch` in the boundary calls
`reportError`, and `startErrorReporting()` in `main.tsx` adds window listeners
for what React never sees (rejected promises, throws in timers, failed dynamic
imports). Sentry project: `peter-co/milkmenot-frontend`
(https://peter-co.sentry.io). Its alert rule "Email on every new issue" mails
Peter once per new issue, so a repeat of a known crash does not mail again.
That rule was added by hand: a new project's default alert only fires for
issues Sentry rates high priority.

How it is set up, and the traps:

- **The DSN is a build-step secret**, `VITE_SENTRY_DSN`, beside the Mapbox key
  in `deploy.yml`. Vite inlines it at build time. Without it reporting is inert
  and the build still succeeds; that is on purpose. Locally, leave it out of
  `.env` unless you are testing reporting, or every dev crash goes to Sentry.
- **The SDK loads only on the first error.** `vendor-sentry` must sit *above*
  the react rule in `manualChunks`: `@sentry/react` contains "react", and the
  generic rule would put ~460KB into the eager `vendor-react`.
  `src/lib/sentryChunk.test.ts` fails if the order flips.
- **The ingest host goes in `connect-src`**, not `script-src`, in
  `public/_headers` — the SDK is our own bundle; only the reports leave. It
  is the exact host from the DSN (`o4512496885497856.ingest.de.sentry.io`,
  EU region). A new DSN from another org or region needs this line changed
  too, or the browser blocks every report silently.
- **Data collection is spelled out.** Sentry 11 collects more by default than
  10 did, so `dataCollection` lists every field. On top of that: no
  breadcrumbs (`maxBreadcrumbs: 0`, they would log Supabase URLs with user
  ids in the query), no tracing, no replay, and `scrubEvent` (the
  `beforeSend`) strips query and hash from the page URL, keeps only the
  `User-Agent` header, and sets the user to `{ ip_address: "0.0.0.0" }`.
  That placeholder matters: an event with *no* IP gets located by Sentry
  from the address it arrived from, down to the city, even with the SDK's
  `infer_ip: "never"` and the project's "Prevent Storing of IP Addresses"
  on (tested against Sentry on 26 November 2026). `/privacy` describes
  exactly this — change both together, and `errorReporting.test.ts` holds
  each promise.
- **Set the secret without a byte-order mark.** Piping a string from
  PowerShell into `gh secret set` prefixes a BOM; the SDK then cannot parse
  the DSN and silently sends nothing (that happened on the first deploy).
  Use `printf '%s' '<dsn>' | gh secret set VITE_SENTRY_DSN` from bash.

- **Source maps go to Sentry, never to the edge.** Added 26 November 2026 so
  production traces name real files and lines. `sentrySourceMaps()` in
  `vite.config.ts` (`@sentry/vite-plugin`) runs only when
  `SENTRY_AUTH_TOKEN` is set: an org auth token, scope `org:ci`, named
  `milkmenot-github-actions` in `peter-co`, set as a secret on the deploy
  build step only. With it the build makes `hidden` maps (no
  `sourceMappingURL` in the bundle), uploads them, and deletes them from
  `dist`; `deploy.yml` then deletes any `.map` left over before wrangler runs,
  because a failed upload only warns and must not ship the maps. Without the
  token: no maps, no plugin, and the build is as before — same rule as the
  DSN. The upload's release is pinned to `BUILD_ID` (the 12-character sha the
  SDK reports); the plugin's default is the full sha, which would never match.
  To read a trace locally, do not rebuild with the token — every such build
  creates a release in Sentry.

To check it end to end: open the live site, and in the console run
`setTimeout(() => { throw new Error("Sentry test " + Date.now()) })`. Within a
minute it should appear as a new issue, and the alert email should follow.
