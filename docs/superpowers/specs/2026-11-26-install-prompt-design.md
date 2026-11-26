# Install MilkMeNot from the phone's browser — design

Date: 2026-11-26. Size: a small change (short design).

## Why
Peter parked the native Android app (Capacitor) as too much work. The lighter
route: a phone visitor is offered to install milkmenot.com as an app, which then
opens full-screen from the home screen like a native one.

## Goals
- milkmenot.com is installable on Android (Chrome) and iPhone (Safari).
- Phone visitors see a small, dismissible offer to install.
- The installed app's identity is right from day one.

## Non-goals
- Offline support or caching of any kind.
- Push notifications, app-store listing, native Android build (parked).

## Anti-goals
- A service worker that serves a stale build or fights the `version.json`
  update banner (`docs/deployment.md`).
- A nagging prompt: no repeat after a dismissal, nothing on desktop, nothing
  inside the installed app.

## Decided with Peter
- Manifest `id`: `"/"` (permanent — never change it).
- Home-screen name: **Milk Me Not** (`name` and `short_name`).
- `capacitor.config.ts`: `appId` → `com.milkmenot.app`, `appName` → `Milk Me Not`.
  Native stays parked; this only stops a future build shipping the placeholder.
- Approach: hand-written manifest + minimal service worker + own banner (below).

## Approaches considered
1. **Hand-written (picked).** Static manifest and icons in `public/`, a ~15-line
   `sw.js`, a small React banner. No dependencies; full control.
2. `vite-plugin-pwa`. Generates manifest and Workbox SW, but precaches the app by
   default (the stale-build risk); turned down, it is a heavy plugin doing little.
3. Manifest only, no SW. Chrome then offers install from its ⋮ menu, but the
   `beforeinstallprompt` event our button needs still expects a real fetch
   handler, so Android would only get a "use the menu" hint.

## Design
**Manifest** — `public/manifest.webmanifest`: `id "/"`, `start_url "/"`,
`scope "/"`, `display "standalone"`, name/short_name "Milk Me Not", description
from `index.html`, `theme_color` and `background_color` from the story palette
in `src/index.css` (story green / story cream), icons 192 and 512 (`any`) plus a
512 `maskable` with padding so the circle mask cannot clip the "m".

**Icons** — generated once from the existing logo
(`public/lovable-uploads/9f030b65-….png`, 940×788) by cropping square; committed
as PNGs under `public/icons/`, plus a 180×180 `apple-touch-icon.png`.

**`index.html`** — add `<link rel="manifest">`, `<meta name="theme-color">`,
`<link rel="apple-touch-icon">`, and the `apple-mobile-web-app-*` meta tags.
No canonical; the Counterscale block and its history patch stay untouched.

**Service worker** — `public/sw.js`, registered from `main.tsx` only in
production builds and never inside Capacitor. Its fetch handler passes page
navigations straight to the network (`respondWith(fetch(request))`) and leaves
everything else alone. It caches nothing, so `version.json` and the update banner
work exactly as today. `public/_headers` already allows `worker-src 'self'`, so
no header change (and no `reviewed` label) is expected; the SW file must be
served without long cache so a fixed SW reaches people — checked during build.

**Install banner** — a slim strip in normal page flow, like `UpdateBanner`
(the phone has a fixed bottom tab bar, so the banner does not float). Copy:
"Get Milk Me Not on your home screen" with **Install** and ×.
- Android/Chrome: appears only after `beforeinstallprompt` fires; Install calls
  the saved event's `prompt()`.
- iPhone/iPad Safari: no install API, so it shows "Tap Share, then Add to Home
  Screen" instead of an Install button.
- Hidden when: not a phone/tablet, already running standalone (installed), the
  update banner is showing, the app is native (Capacitor), or the visitor has
  dismissed it. × or declining Chrome's dialog stores the dismissal in
  `localStorage` for good; `appinstalled` hides it too.
- The show/hide decision is a pure function, unit-tested; the banner renders it.

## Left to the builder
Exact copy and styling within the story palette (contrast per `UpdateBanner`'s
notes), where the registration code lives, e2e coverage (assert the banner does
not appear on desktop Chromium so existing tests stay green).

## Done
Unit tests for the show/hide logic; lint, types, unit and e2e green; prompt seen
in a real mobile browser or emulator; PR opened.
