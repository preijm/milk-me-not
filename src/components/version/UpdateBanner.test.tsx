import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { VersionCheckResult } from "@/hooks/useVersionCheck";

const state = vi.hoisted(() => ({ current: {} as VersionCheckResult }));
vi.mock("@/contexts/VersionContext", () => ({ useVersion: () => state.current }));

const { UpdateBanner } = await import("./UpdateBanner");

const base: VersionCheckResult = {
  isLoading: false,
  error: null,
  latestVersion: null,
  currentVersion: "1.0.0",
  buildId: "aaaa",
  deployedBuildId: "bbbb",
  hasUpdate: true,
  publishedIsNewer: false,
  isMajor: false,
  requiresApkUpdate: false,
  isNative: false,
  showUpdateNotice: true,
  dismissUpdate: () => {},
  recheckVersion: async () => {},
};

const published = {
  id: "1",
  version: "1.0.0",
  release_notes: "Older notes",
  is_major: false,
  requires_apk_update: false,
  min_supported_version: null,
  published_at: "2026-01-15T00:00:00Z",
};

describe("UpdateBanner", () => {
  beforeEach(() => {
    state.current = { ...base };
  });

  it("offers the update when only the build has moved on", () => {
    // The app_versions table carries release notes and the native APK rule,
    // not the answer to "is this tab behind". Requiring a row here meant a
    // correctly detected new deploy rendered nothing at all.
    render(<UpdateBanner />);
    expect(screen.getByText("New version")).toBeInTheDocument();
    expect(screen.getByText(/fresher one of these/)).toBeInTheDocument();
  });

  it("says plainly that a refresh costs the reader nothing", () => {
    // The worry when a bar appears mid-session asking you to reload is that
    // the rating you were halfway through goes with it.
    render(<UpdateBanner />);
    expect(screen.getByText(/Nothing you have rated is affected/)).toBeInTheDocument();
  });

  it("does not print a version number that is not actually newer", () => {
    // The row is simply the most recent one there is. Printing it regardless
    // read "Version 1.0.0 available (current: 1.0.0)" on a plain redeploy.
    state.current = { ...base, latestVersion: published, publishedIsNewer: false };
    render(<UpdateBanner />);
    expect(screen.getByText("New version")).toBeInTheDocument();
    expect(screen.queryByText(/Version 1\.0\.0/)).toBeNull();
    expect(screen.queryByText("View release notes")).toBeNull();
  });

  it("names the version when a newer one really was published", () => {
    state.current = {
      ...base,
      latestVersion: { ...published, version: "1.1.0", release_notes: "New notes" },
      publishedIsNewer: true,
    };
    render(<UpdateBanner />);
    expect(screen.getByText("Version 1.1.0")).toBeInTheDocument();
    expect(screen.getByText(/You are on 1\.0\.0/)).toBeInTheDocument();
  });

  it("stays out of the way when there is nothing to say", () => {
    state.current = { ...base, hasUpdate: false, showUpdateNotice: false };
    const { container } = render(<UpdateBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives its icon-only controls a name", () => {
    // Both labels are hidden below the `sm` breakpoint, so on a phone these
    // are bare icons.
    render(<UpdateBanner />);
    expect(screen.getByLabelText("Refresh to the new version")).toBeInTheDocument();
    expect(screen.getByLabelText("Dismiss until tomorrow")).toBeInTheDocument();
  });

  it("paints the dismiss control against the bar rather than in it", () => {
    // `variant="ghost"` resolved to `text-primary` — story green on a story
    // green bar. The × was present, clickable and invisible.
    render(<UpdateBanner />);
    const dismiss = screen.getByLabelText("Dismiss until tomorrow");
    expect(dismiss.className).toContain("text-white/80");
    expect(dismiss.className).not.toContain("text-primary");
  });

  it("sits on a green the words can actually be read on", () => {
    // --story-green is 151 100% 37%, luminance 0.371. Pure white on it is
    // 2.49:1 — under the 4.5:1 AA wants for body text and under the 3:1 a
    // control needs to be discernible at all, so painting the × white was not
    // enough on its own. --story-green-dark carries the headline at 6.21:1.
    const { container } = render(<UpdateBanner />);
    const root = container.firstElementChild;
    expect(root?.classList.contains("bg-story-green-dark")).toBe(true);
    expect(root?.classList.contains("bg-story-green")).toBe(false);
  });

  it("takes its own space instead of covering the header", () => {
    // Fixed at top-0 z-50 against a header sticky at top-0 z-50, it printed
    // the wordmark and the headline over each other in the same 36px band.
    const { container } = render(<UpdateBanner />);
    expect(container.firstElementChild?.classList.contains("fixed")).toBe(false);
  });
});
