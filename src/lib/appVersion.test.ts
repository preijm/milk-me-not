import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isNewerVersion,
  isMajorUpdate,
  getDismissedVersions,
  dismissVersion,
  shouldShowVersion,
  VERSION_STORAGE_KEY,
} from "./appVersion";

describe("appVersion utilities", () => {
  describe("isNewerVersion", () => {
    it("returns true when latest major is higher", () => {
      expect(isNewerVersion("1.0.0", "2.0.0")).toBe(true);
      expect(isNewerVersion("1.9.9", "2.0.0")).toBe(true);
    });

    it("returns true when latest minor is higher", () => {
      expect(isNewerVersion("1.0.0", "1.1.0")).toBe(true);
      expect(isNewerVersion("1.5.0", "1.6.0")).toBe(true);
    });

    it("returns true when latest patch is higher", () => {
      expect(isNewerVersion("1.0.0", "1.0.1")).toBe(true);
      expect(isNewerVersion("1.5.3", "1.5.4")).toBe(true);
    });

    it("returns false when versions are equal", () => {
      expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
      expect(isNewerVersion("2.5.3", "2.5.3")).toBe(false);
    });

    it("returns false when current is newer", () => {
      expect(isNewerVersion("2.0.0", "1.0.0")).toBe(false);
      expect(isNewerVersion("1.5.0", "1.4.0")).toBe(false);
      expect(isNewerVersion("1.0.5", "1.0.4")).toBe(false);
    });

    it("handles partial version strings", () => {
      expect(isNewerVersion("1", "2")).toBe(true);
      expect(isNewerVersion("1.0", "1.1")).toBe(true);
    });
  });

  describe("isMajorUpdate", () => {
    it("returns true when major version increases", () => {
      expect(isMajorUpdate("1.0.0", "2.0.0")).toBe(true);
      expect(isMajorUpdate("1.9.9", "2.0.0")).toBe(true);
    });

    it("returns false for minor updates", () => {
      expect(isMajorUpdate("1.0.0", "1.5.0")).toBe(false);
    });

    it("returns false for patch updates", () => {
      expect(isMajorUpdate("1.0.0", "1.0.5")).toBe(false);
    });

    it("returns false when versions are equal", () => {
      expect(isMajorUpdate("2.0.0", "2.0.0")).toBe(false);
    });
  });

  describe("localStorage operations", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe("getDismissedVersions", () => {
      it("returns empty object when no versions dismissed", () => {
        expect(getDismissedVersions()).toEqual({});
      });

      it("returns stored dismissed versions", () => {
        const versions = {
          "1.0.0": { dismissedAt: "2024-01-01", remindAfter: "2024-01-02" },
        };
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
        expect(getDismissedVersions()).toEqual(versions);
      });

      it("returns empty object on parse error", () => {
        localStorage.setItem(VERSION_STORAGE_KEY, "invalid json");
        expect(getDismissedVersions()).toEqual({});
      });
    });

    describe("dismissVersion", () => {
      it("stores dismissed version with remind time", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

        dismissVersion("1.5.0", 24);

        const dismissed = getDismissedVersions();
        expect(dismissed["1.5.0"]).toBeDefined();
        expect(dismissed["1.5.0"].dismissedAt).toBe("2024-01-01T00:00:00.000Z");
        expect(dismissed["1.5.0"].remindAfter).toBe("2024-01-02T00:00:00.000Z");

        vi.useRealTimers();
      });

      it("uses default 24 hour remind time", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));

        dismissVersion("1.0.0");

        const dismissed = getDismissedVersions();
        expect(dismissed["1.0.0"].remindAfter).toBe("2024-01-02T12:00:00.000Z");

        vi.useRealTimers();
      });
    });

    describe("shouldShowVersion", () => {
      it("returns true for never-dismissed versions", () => {
        expect(shouldShowVersion("1.0.0")).toBe(true);
      });

      it("returns false for recently dismissed versions", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

        dismissVersion("1.0.0", 24);
        expect(shouldShowVersion("1.0.0")).toBe(false);

        vi.useRealTimers();
      });

      it("returns true when remind time has passed", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

        dismissVersion("1.0.0", 1); // 1 hour remind

        // Move time forward 2 hours
        vi.setSystemTime(new Date("2024-01-01T02:00:00Z"));

        expect(shouldShowVersion("1.0.0")).toBe(true);

        vi.useRealTimers();
      });
    });
  });
});

describe("isNewerVersion, given nonsense", () => {
  // VersionProvider wraps the whole app and has no error boundary above it, so
  // throwing here is a blank page for every reader rather than a broken banner.
  it("says no rather than throwing", () => {
    expect(isNewerVersion("1.0.0", undefined as unknown as string)).toBe(false);
    expect(isNewerVersion(undefined as unknown as string, "1.0.0")).toBe(false);
    expect(isNewerVersion("1.0.0", null as unknown as string)).toBe(false);
  });
});
