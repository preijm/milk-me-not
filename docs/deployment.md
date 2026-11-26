# Deployment and the update banner

_Moved out of CLAUDE.md on 2026-11-24 so it is read only when needed._

## Deployment
The site is hosted on **Cloudflare Workers**, not Lovable. `deploy.yml` runs on
every push to `main`: test, build, then `bunx wrangler@4 deploy`. No manual
publish step anywhere.

`wrangler.toml` declares an assets-only Worker — there is no `main` script, so
requests are served from the edge without invoking Worker code, which keeps them
free and unmetered. `not_found_handling = "single-page-application"` is what
makes deep links like `/product/:productId` resolve instead of 404ing.

Three repo secrets are required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
and `VITE_MAPBOX_PUBLIC_KEY`. The Mapbox key is set on the *build* step, because
Vite inlines `VITE_*` at build time — setting it on the Worker afterwards is too
late.

Deploy does not use `cloudflare/wrangler-action`. That action installs wrangler
with npm, and npm resolution here has been fragile enough to kill a deploy
before wrangler ever ran. `bunx` uses the same toolchain as every other step.

`milkmenot.com` is on Cloudflare DNS, but mail still runs through IONOS — nine
of the zone's ten records are mail, including three DKIM CNAMEs. Do not touch
DNS records casually.


## An open tab learns about a deploy from `version.json`, not from a table
A loaded single-page app never asks for `index.html` again, so a tab left open
keeps its bundle for as long as it stays open. Cache headers cannot help:
`must-revalidate` is honoured on the next request and there is no next request.

The build stamps a `BUILD_ID` — the commit sha in CI, a timestamp locally —
into the bundle *and* into `dist/version.json`, from the one constant in
`vite.config.ts`. `useVersionCheck` fetches that file at load, when the tab
returns to the foreground (throttled to 5 minutes) and every 30 minutes, and
shows `UpdateBanner` when it differs. Nothing has to be remembered at release
time, which is the whole point.

Two things that look redundant and are not:

- **The fetch treats anything unexpected as "no answer".** The assets Worker
  serves `index.html` with a 200 for any path it cannot find, so a deploy
  missing this file answers with HTML rather than a 404. Reading that as a new
  version would put the banner in front of every reader forever.
- **`app_versions` and `APP_VERSION` still exist, and no longer decide this.**
  That table carries release notes and the native APK rule. It held one row,
  `1.0.0` from January, while the site deployed dozens of times — and because
  `APP_VERSION` is also `1.0.0`, `isNewerVersion` was permanently false and the
  banner could not fire at all. It is fine for that row to be stale now; the
  banner only prints a version number when the row genuinely beats the running
  one.

On a native build this is a no-op by construction: Capacitor serves the bundled
`version.json`, so it always matches and updates stay the APK's business.




## The service worker exists only to make the site installable
`public/sw.js` lets phones install milkmenot.com as an app (the banner is
`src/components/install/InstallBanner.tsx`). It caches nothing and passes page
loads straight to the network, so it cannot serve an old build or interfere with
`version.json` above. It is registered only in production builds and never inside
the Capacitor shell.

### Removing the service worker
Do **not** simply delete `public/sw.js`. Phones that already have it keep it:
the browser checks `/sw.js` for updates, the assets Worker answers that missing
path with `index.html`, the update fails on its MIME type, and the old worker
stays installed. Instead, replace the file's contents with a worker that removes
itself, and drop the `registerServiceWorker` call from `src/main.tsx`:

```js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.registration.unregister());
```

Keep that file deployed for a few months before deleting it.
