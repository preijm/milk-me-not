import { describe, expect, it, vi } from "vitest";
import {
  DISMISS_KEY,
  installMode,
  isDismissed,
  isIosSafari,
  rememberDismissal,
  type InstallEnv,
} from "./installPrompt";

const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1";
const IPHONE_FIREFOX =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15";
// iPadOS Safari asks for the desktop site and reports itself as a Mac.
const MAC_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
const DESKTOP_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const env = (over: Partial<InstallEnv>): InstallEnv => ({
  userAgent: ANDROID_CHROME,
  maxTouchPoints: 5,
  standalone: false,
  native: false,
  updateShowing: false,
  dismissed: false,
  hasDeferredPrompt: false,
  ...over,
});

describe("installMode", () => {
  it("offers the real install on Android once Chrome hands over its prompt", () => {
    expect(installMode(env({ hasDeferredPrompt: true }))).toBe("android");
  });

  it("stays quiet on Android until the prompt event has arrived", () => {
    expect(installMode(env({ hasDeferredPrompt: false }))).toBeNull();
  });

  it("never shows on desktop, even if desktop Chrome offers an install", () => {
    expect(installMode(env({ userAgent: DESKTOP_CHROME, maxTouchPoints: 0, hasDeferredPrompt: true }))).toBeNull();
  });

  it("shows the Share hint on iPhone Safari", () => {
    expect(installMode(env({ userAgent: IPHONE_SAFARI }))).toBe("ios");
  });

  it("shows the Share hint on an iPad that reports itself as a Mac", () => {
    expect(installMode(env({ userAgent: MAC_SAFARI, maxTouchPoints: 5 }))).toBe("ios");
  });

  it("does not treat a real Mac as an iPad", () => {
    expect(installMode(env({ userAgent: MAC_SAFARI, maxTouchPoints: 0 }))).toBeNull();
  });

  it("keeps the Safari-only hint away from Chrome and Firefox on iPhone", () => {
    expect(installMode(env({ userAgent: IPHONE_CHROME }))).toBeNull();
    expect(installMode(env({ userAgent: IPHONE_FIREFOX }))).toBeNull();
  });

  it.each(["standalone", "native", "updateShowing", "dismissed"] as const)(
    "hides when %s",
    (flag) => {
      expect(installMode(env({ hasDeferredPrompt: true, [flag]: true }))).toBeNull();
      expect(installMode(env({ userAgent: IPHONE_SAFARI, [flag]: true }))).toBeNull();
    },
  );
});

describe("isIosSafari", () => {
  it("recognises iPhone Safari and rejects desktop Chrome", () => {
    expect(isIosSafari(IPHONE_SAFARI, 5)).toBe(true);
    expect(isIosSafari(DESKTOP_CHROME, 0)).toBe(false);
  });
});

describe("dismissal storage", () => {
  const throwing = {
    getItem: () => {
      throw new Error("private mode");
    },
    setItem: () => {
      throw new Error("private mode");
    },
  } as unknown as Storage;

  it("round-trips through storage", () => {
    localStorage.removeItem(DISMISS_KEY);
    expect(isDismissed()).toBe(false);
    rememberDismissal();
    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(isDismissed()).toBe(true);
    localStorage.removeItem(DISMISS_KEY);
  });

  it("reads as not dismissed when storage throws", () => {
    expect(isDismissed(throwing)).toBe(false);
  });

  it("does not throw when storage refuses the write", () => {
    expect(() => rememberDismissal(throwing)).not.toThrow();
  });

  it("survives a browser that blocks site data, where even reading localStorage throws", () => {
    const spy = vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    try {
      expect(isDismissed()).toBe(false);
      expect(() => rememberDismissal()).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});
