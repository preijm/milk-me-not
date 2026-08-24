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
    expect(screen.getByText("A new version is available")).toBeInTheDocument();
  });

  it("does not print a version number that is not actually newer", () => {
    // The row is simply the most recent one there is. Printing it regardless
    // read "Version 1.0.0 available (current: 1.0.0)" on a plain redeploy.
    state.current = { ...base, latestVersion: published, publishedIsNewer: false };
    render(<UpdateBanner />);
    expect(screen.getByText("A new version is available")).toBeInTheDocument();
    expect(screen.queryByText(/1\.0\.0 available/)).toBeNull();
    expect(screen.queryByText("Older notes")).toBeNull();
  });

  it("names the version when a newer one really was published", () => {
    state.current = {
      ...base,
      latestVersion: { ...published, version: "1.1.0", release_notes: "New notes" },
      publishedIsNewer: true,
    };
    render(<UpdateBanner />);
    expect(screen.getByText("Version 1.1.0 available")).toBeInTheDocument();
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
});
