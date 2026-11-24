# Analytics (Counterscale) and the history patch

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Analytics is Counterscale, and `ht=3` is not a stuck handshake
Cookieless, self-hosted on `counterscale.peterreijm.workers.dev`, loaded by an
inline script in `index.html` with `data-site-id: milkmenot.com`. It is gated on
the live hostname, so `bun dev`, preview deploys and the workers.dev URL never
write into the production dataset, and on a per-browser opt-out remembered in
`localStorage`: `?notrack=1` stops counting this browser, `?notrack=0` starts
again.

**Set `?notrack=1` before debugging the tracker.** Every page loaded while
poking at it is a real pageview in the real dataset, geolocated to wherever you
are. Ten went in this way on 2026-08-24.

Unique visitors are counted without a cookie by riding the HTTP cache. The
tracker calls `/cache?sid=...` first, and the server encodes the hit count in
the *seconds* field of `Last-Modified`: no `If-Modified-Since` returns
`{"ht":1}` with `00:00:01`, sending that back returns `{"ht":2}` with
`00:00:02`, and so on. The number is then passed to `/collect?...&ht=N`. The
state lives entirely in the browser's cache; the Worker keeps nothing.

`ht` reaches 3 and stays there for the rest of the day. That is the design, not
a handshake that failed to complete — Counterscale caps it deliberately, "to
avoid exposing exact hit counts publicly":

- **1** — first visit, and the only value that sets `newVisitor`
- **2** — anti-bounce; the visitor came back for a second page
- **3** — a regular page view, meaning three or more hits

So a browser reporting `ht=3` on every navigation is a healthy session, and
`/cache` answering 200 rather than 304 every time is equally correct. There is
no caching bug there. An afternoon has already been spent looking for one.

## The history patch in `index.html` is load-bearing
Counterscale reads `<link rel="canonical">` in preference to `location`, and it
records a pageview *synchronously* inside its own `pushState` patch. React has
not re-rendered by then, so `react-helmet-async` still has the previous page's
canonical in the DOM from `Seo.tsx` — which filed every client-side navigation
one page behind. Clicking through to `/about` recorded `/`. Cold loads escaped
it only because React has not rendered any canonical yet when the tracker fires
at roughly 334ms, so it falls back to `location`.

The patch wraps `history` *before* the tracker script is appended, so those
wrappers sit inside the tracker's own and the canonical is already correct when
it looks. Two things it encodes that are easy to undo by accident:

- **Order is the whole trick.** Move the patch below the
  `document.head.appendChild` and it wraps nothing — the tracker's wrapper has
  to be the outer one.
- **The `replaceState` pathname guard is not optional.** The tracker patches
  `pushState` and `popstate` but never `replaceState`, so the logged-in
  `<Navigate to="/feed" replace />`, the `ProtectedRoute` redirects and the rate
  deep links went uncounted. They are reported now, but *only* when the pathname
  changes: `useResultsState` rewrites the query string through `replaceState` on
  every filter keystroke, and counting those would bury the real numbers under
  `/results`. The pageview is handed over by calling the tracker's own
  `pushState` wrapper with the real push suppressed underneath, so nothing is
  added to the history stack.

Data recorded before 2026-08-24 still carries the off-by-one, so `/` is inflated
by roughly a hit per session and the exit page of each visit is missing. A trend
line crossing that date changes shape from the fix alone.


