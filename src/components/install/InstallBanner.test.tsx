import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DISMISS_KEY } from "@/lib/installPrompt";

const version = vi.hoisted(() => ({ showUpdateNotice: false, isNative: false }));
vi.mock("@/contexts/VersionContext", () => ({ useVersion: () => version }));

const { InstallBanner } = await import("./InstallBanner");

const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const HEADLINE = /get milk me not on your home screen/i;

function setUserAgent(ua: string) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
}

/** A stand-in for Chrome's BeforeInstallPromptEvent. */
function firePrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("InstallBanner", () => {
  beforeEach(() => {
    localStorage.removeItem(DISMISS_KEY);
    version.showUpdateNotice = false;
    version.isNative = false;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers Chrome's install on Android once the prompt event arrives", async () => {
    setUserAgent(ANDROID);
    render(<InstallBanner />);
    expect(screen.queryByText(HEADLINE)).toBeNull();

    const event = firePrompt("accepted");
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByText(HEADLINE)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /install/i }));
    });
    expect(event.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("counts declining Chrome's dialog as a dismissal", async () => {
    setUserAgent(ANDROID);
    render(<InstallBanner />);
    firePrompt("dismissed");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /install/i }));
    });
    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("shows the Share hint on iPhone Safari, without an Install button", () => {
    setUserAgent(IPHONE);
    render(<InstallBanner />);
    expect(screen.getByText(HEADLINE)).toBeInTheDocument();
    expect(screen.getByText(/tap share, then add to home screen/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^install/i })).toBeNull();
  });

  it("remembers the × for good", () => {
    setUserAgent(IPHONE);
    const { unmount } = render(<InstallBanner />);
    fireEvent.click(screen.getByRole("button", { name: /don't show again/i }));
    expect(screen.queryByText(HEADLINE)).toBeNull();
    expect(localStorage.getItem(DISMISS_KEY)).toBe("1");

    unmount();
    render(<InstallBanner />);
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("goes away once the app is installed", () => {
    setUserAgent(ANDROID);
    render(<InstallBanner />);
    firePrompt();
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("stays away while the update banner is up", () => {
    setUserAgent(IPHONE);
    version.showUpdateNotice = true;
    render(<InstallBanner />);
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("stays away inside the native app", () => {
    setUserAgent(IPHONE);
    version.isNative = true;
    render(<InstallBanner />);
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });

  it("never shows on desktop", () => {
    setUserAgent(DESKTOP);
    render(<InstallBanner />);
    firePrompt();
    expect(screen.queryByText(HEADLINE)).toBeNull();
  });
});
