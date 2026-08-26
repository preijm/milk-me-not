import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests, for the things jsdom cannot answer.
 *
 * The vitest suite covers a lot now, and there is a whole class of failure it
 * is structurally unable to see: anything that needs a real browser. The
 * scanner is the clearest case — it wants `getUserMedia`, a `<video>` element
 * that actually decodes frames, and either `BarcodeDetector` or a canvas. None
 * of that exists in jsdom, so the camera bug that took a morning to diagnose
 * could never have been caught by a unit test, however many were written.
 *
 * These run against the built bundle rather than the dev server, so what is
 * tested is what gets deployed.
 */
export default defineConfig({
  testDir: "./e2e",

  // Vitest owns `src/**`; keeping these out of it means neither runner tries
  // to execute the other's tests.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: "http://localhost:4173",
    // Kept only for a failure, since a trace per run is large and dull.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The member bar that owns the scan button is `lg:hidden`, and the
        // scanner is a thing people use in a shop with a phone. Testing it at
        // 1280px would be testing something nobody does.
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        permissions: ["camera"],
        launchOptions: {
          args: [
            // Grant the camera without a prompt, and hand it a synthetic
            // stream so `getUserMedia` resolves on a machine with no webcam —
            // which is every CI runner.
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
      },
    },
  ],

  // The real bundle, served the way it ships. `reuseExistingServer` locally so
  // a rerun does not rebuild for 30 seconds each time.
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
