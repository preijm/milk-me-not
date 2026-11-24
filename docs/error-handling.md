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

There is no error reporting service. Sentry was wired in but never given a DSN,
so it never sent a report; it was removed in November 2026 rather than kept as
a dependency to upgrade for nothing. If it comes back, git history has the
setup, and three things in it are easy to get wrong: `@sentry/react` contains
the substring "react", so its `manualChunks` rule must sit *above* the react
one or the SDK lands in the eager `vendor-react`; the DSN is a build-step
secret like the Mapbox key; and its ingest host belongs in `connect-src`, not
`script-src`. Sentry 11 also collects more by default than 10 did, so
`dataCollection` has to be spelled out to keep `/privacy` true.


