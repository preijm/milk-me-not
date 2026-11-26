import { defineConfig, devices } from "@playwright/test";

/**
 * The smoke test against the live site — not the browser tests.
 *
 * `playwright.config.ts` runs `e2e/` against a local build with every request
 * stubbed, so it says whether the code works. This runs `e2e-live/` against
 * milkmenot.com itself, so it says whether the deployed site works: real
 * bundle, real edge, real Supabase. Run after every deploy and from the health
 * check. Override the target with SITE_URL.
 *
 *   bunx playwright test -c playwright.live.config.ts
 */
export default defineConfig({
  testDir: "./e2e-live",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Once, everywhere. This talks to the real network, and one slow answer from
  // Supabase is not an outage worth an issue.
  retries: 1,
  workers: 2,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: process.env.SITE_URL || "https://milkmenot.com",
    // public/sw.js makes the site installable. Once a service worker controls
    // a page, requests that pass through it can slip past page.route(), which
    // the backend stub depends on. Nothing tested here needs the worker.
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      // A phone, because that is who uses this — in a shop, scanning a carton.
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
