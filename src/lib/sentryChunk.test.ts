import { describe, it, expect } from "vitest";
import config from "../../vite.config.ts?raw";

/**
 * Keeps the Sentry SDK out of the eager `vendor-react` chunk.
 *
 * `manualChunks` in vite.config.ts returns on the first rule that matches, and
 * `@sentry/react` contains the substring "react". With the react rule first,
 * the whole SDK lands in vendor-react, which every visitor downloads before
 * the page renders — 440KB became 904KB the last time this happened. The
 * dynamic import in errorReporting.ts only helps while the sentry rule sits
 * above the react one.
 *
 * Read as text rather than imported: loading the config would pull in every
 * Vite plugin just to look at two lines.
 */
describe("vendor chunk rules", () => {
  it("sends @sentry to its own chunk before the react rule can claim it", () => {
    const sentryRule = config.indexOf("id.includes('@sentry')) return 'vendor-sentry'");
    const reactRule = config.indexOf("id.includes('react')");

    expect(sentryRule).toBeGreaterThan(-1);
    expect(reactRule).toBeGreaterThan(-1);
    expect(sentryRule).toBeLessThan(reactRule);
  });
});
