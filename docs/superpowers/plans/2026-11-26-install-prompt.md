# Install prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make milkmenot.com installable from a phone's browser and offer phone visitors a dismissible install banner.

**Architecture:** Static manifest, icons and a pass-through service worker in `public/`; a pure decision function in `src/lib/installPrompt.ts`; a hook that captures `beforeinstallprompt`; a slim in-flow banner rendered beside `VersionCheck` in `App.tsx`.

**Tech Stack:** React 19, TypeScript, Vite, vitest + jsdom, Playwright, sharp (already installed) for the one-off icon script.

**Spec:** `docs/superpowers/specs/2026-11-26-install-prompt-design.md`

## Global Constraints

- Manifest `id` is exactly `"/"`; `start_url "/"`, `scope "/"`, `display "standalone"`.
- `name` and `short_name` are exactly `Milk Me Not`.
- `theme_color "#00bf63"` (story green), `background_color "#f6faf7"` (story cream).
- `capacitor.config.ts`: `appId 'com.milkmenot.app'`, `appName 'Milk Me Not'`.
- The service worker caches nothing.
- `index.html`: no canonical; the Counterscale block is untouched.
- Dismissal key in localStorage: `mmn-install-dismissed` (value `"1"`), permanent.
- No new dependencies. No edits under `public/_headers`, `.github/`, `supabase/`.

## Review Focus

1. `localStorage` throws (Safari private mode) → banner logic must not crash; treat as "not dismissed" on read, swallow on write.
2. iPadOS Safari reports a Mac user agent → detect via `navigator.maxTouchPoints > 1` with `Macintosh`.
3. Chrome on iOS (`CriOS`), Firefox on iOS (`FxiOS`) cannot Add to Home Screen the same way → show the iOS hint only for Safari (iOS ≥16.4 allows other browsers, but Share sheet wording differs; keep Safari only).
4. User declines Chrome's own dialog (`outcome: "dismissed"`) → counts as dismissal.
5. Playwright `page.route` stubs stop seeing requests once a SW controls the page → e2e configs set `serviceWorkers: "block"`.

---

### Task 1: Decision logic

**Files:**
- Create: `src/lib/installPrompt.ts`
- Test: `src/lib/installPrompt.test.ts`

**Interfaces:**
- Produces:
  - `type InstallMode = "android" | "ios" | null`
  - `interface InstallEnv { userAgent: string; maxTouchPoints: number; standalone: boolean; native: boolean; updateShowing: boolean; dismissed: boolean; hasDeferredPrompt: boolean }`
  - `installMode(env: InstallEnv): InstallMode`
  - `isIosSafari(userAgent: string, maxTouchPoints: number): boolean`
  - `isDismissed(storage?: Storage): boolean`, `rememberDismissal(storage?: Storage): void`
  - `DISMISS_KEY = "mmn-install-dismissed"`

- [ ] Tests (`describe("installMode")`): returns `"android"` for Android UA with `hasDeferredPrompt`; `null` for Android UA without it; `"ios"` for iPhone Safari UA; `"ios"` for iPad-as-Mac UA with `maxTouchPoints: 5`; `null` for desktop Mac UA with `maxTouchPoints: 0`; `null` for `CriOS` iPhone UA; `null` when `standalone`, `native`, `updateShowing`, or `dismissed` is true (each separately). `isDismissed` returns false when `getItem` throws; `rememberDismissal` does not throw when `setItem` throws.
- [ ] Run `bunx vitest run src/lib/installPrompt.test.ts` → FAIL.
- [ ] Implement. Android path needs only `hasDeferredPrompt` (the event itself proves the browser can install) plus a mobile UA (`/Android/i`), so desktop Chrome never sees the banner.
- [ ] Run → PASS. Commit.

### Task 2: Hook and banner

**Files:**
- Create: `src/hooks/useInstallPrompt.ts`, `src/components/install/InstallBanner.tsx`
- Test: `src/components/install/InstallBanner.test.tsx`
- Modify: `src/App.tsx` (render `<InstallBanner />` right after `<VersionCheck />`)

**Interfaces:**
- Consumes: Task 1 exports; `useVersion().showUpdateNotice`; `isNativeApp()` from `src/lib/platformDetection.ts`.
- Produces: `useInstallPrompt(): { mode: InstallMode; install: () => Promise<void>; dismiss: () => void }`.

- [ ] Tests (mock `useVersion`, `isNativeApp`): with an Android UA, dispatching a `beforeinstallprompt` event (with `preventDefault`, `prompt` and `userChoice` stubs) shows "Get Milk Me Not on your home screen" and an Install button; clicking Install calls `prompt()`; `userChoice` `{outcome:"dismissed"}` stores the key and hides the banner; with an iPhone Safari UA the banner shows the "Share" hint and no Install button; × stores the key and hides it; `appinstalled` hides it; nothing renders on a desktop UA.
- [ ] Run → FAIL.
- [ ] Implement the hook: listen for `beforeinstallprompt` (call `preventDefault`, keep the event), `appinstalled`; standalone from `matchMedia("(display-mode: standalone)").matches || navigator.standalone`. Banner styling mirrors `UpdateBanner` (`bg-story-green-dark text-white`, `max-w-304` row, `StoryButton tone="paper"`, white ×); copy: kicker "Install", headline "Get Milk Me Not on your home screen", sub-line Android "Opens full-screen, like any other app." / iOS "Tap Share, then Add to Home Screen." × `aria-label="Don't show again"`.
- [ ] Run → PASS. Wire into `App.tsx`. Commit.

### Task 3: Manifest, icons, head tags, service worker, Capacitor ID

**Files:**
- Create: `scripts/generate-app-icons.ts`, `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`, `public/apple-touch-icon.png`, `public/sw.js`, `src/lib/registerServiceWorker.ts`
- Modify: `index.html` (head, above the Counterscale comment), `src/main.tsx`, `capacitor.config.ts`, `playwright.config.ts`, `playwright.live.config.ts`

- [ ] Icon script: crop `public/lovable-uploads/9f030b65-….png` to a centred 788×788 square; write 192/512/180 sizes; maskable = the square scaled to 80% on a `#00c065`-ish green fill matching the blob (sample the pixel) at 512. Run `bunx tsx scripts/generate-app-icons.ts`; check the PNGs visually.
- [ ] Manifest with the Global Constraints values, description from `index.html`, icons with `purpose` `any` / `maskable`.
- [ ] `index.html`: `<link rel="manifest" href="/manifest.webmanifest">`, `<meta name="theme-color" content="#00bf63">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="Milk Me Not">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">`.
- [ ] `public/sw.js`: `install` → `skipWaiting()`, `activate` → `clients.claim()`, `fetch` → only for `request.mode === "navigate"`, `respondWith(fetch(request))`.
- [ ] `registerServiceWorker()`: no-op unless `import.meta.env.PROD`, `"serviceWorker" in navigator`, and `!isNativeApp()`; registers `/sw.js` on `load`; errors swallowed. Call from `main.tsx`.
- [ ] Playwright configs: `serviceWorkers: "block"` in `use`.
- [ ] `capacitor.config.ts` values per Global Constraints.
- [ ] `npm run build`; confirm `dist/manifest.webmanifest`, `dist/sw.js`, `dist/icons/*` exist. Commit.

### Task 4: e2e and verification

**Files:**
- Create: `e2e/install-prompt.spec.ts`

- [ ] Test: Android UA context (`userAgent` override); open `/`; dispatch a synthetic `beforeinstallprompt` (with stubbed `prompt`/`userChoice`); banner visible; click ×; reload; banner absent.
- [ ] `bunx tsc --build`, `npm run lint`, `bunx vitest run`, `npm run test:e2e` → all green.
- [ ] Real-browser check: Chrome DevTools Application → Manifest shows no errors and "installable"; banner seen in a mobile-emulated Chrome. Record what could not be checked (real iPhone).
- [ ] Commit, push, open PR.
