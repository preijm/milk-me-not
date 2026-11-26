import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reportError, startErrorReporting, isErrorReportingConfigured, scrubEvent } from "./errorReporting";

/**
 * The reporter, and the promise it makes: never make things worse.
 *
 * This runs when something has already gone wrong, which is the worst possible
 * moment to throw. An error reporter that fails while reporting an error is how
 * one broken component becomes a broken page — so every failure path here has
 * to end quietly, and that is most of what is tested.
 *
 * With no DSN configured — which is the state of this repository until someone
 * sets one — it must also do nothing at all: no import, no request, no cost.
 */

describe("errorReporting", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is inert until a DSN is set", () => {
    // The test environment has none, which is also production's state today.
    expect(isErrorReportingConfigured()).toBe(false);
  });

  it("still says something to the console, so a developer standing there sees it", async () => {
    await reportError(new Error("kaboom"));

    expect(console.error).toHaveBeenCalled();
    expect(vi.mocked(console.error).mock.calls[0][0]).toContain("caught");
  });

  it("resolves rather than throwing, whatever it is handed", async () => {
    // Anything can be thrown in JavaScript, and this is called from a catch.
    await expect(reportError(new Error("an error"))).resolves.toBeUndefined();
    await expect(reportError("a string")).resolves.toBeUndefined();
    await expect(reportError(null)).resolves.toBeUndefined();
    await expect(reportError(undefined)).resolves.toBeUndefined();
    await expect(reportError({ weird: true })).resolves.toBeUndefined();
  });

  it("carries the context it was given without choking on it", async () => {
    await expect(
      reportError(new Error("with context"), { componentStack: "at Thing" }),
    ).resolves.toBeUndefined();
  });

  describe("the handlers React cannot provide", () => {
    it("listens for uncaught errors and unhandled rejections", () => {
      const add = vi.spyOn(window, "addEventListener");
      startErrorReporting();

      const listened = add.mock.calls.map(([event]) => event);
      expect(listened).toContain("error");
      expect(listened).toContain("unhandledrejection");
    });

    it("stops listening when told to", () => {
      // A listener left behind outlives whatever registered it.
      const remove = vi.spyOn(window, "removeEventListener");
      const stop = startErrorReporting();
      stop();

      const removed = remove.mock.calls.map(([event]) => event);
      expect(removed).toContain("error");
      expect(removed).toContain("unhandledrejection");
    });

    it("reports an uncaught error that reaches the window", () => {
      startErrorReporting();

      window.dispatchEvent(
        new ErrorEvent("error", { error: new Error("from a timer"), message: "from a timer" }),
      );

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("what leaves the browser", () => {
    // Each of these is a promise /privacy makes in plain words.
    const event = () => ({
      type: undefined,
      request: {
        url: "https://milkmenot.com/results?brand=oatly&user=abc#top",
        headers: { "User-Agent": "phone", Referer: "https://elsewhere.example/?q=secret", Cookie: "a=b" },
      },
      user: { id: "someone", email: "a@b.c", ip_address: "{{auto}}" },
    });

    it("drops the query and hash from the page address", () => {
      expect(scrubEvent(event()).request?.url).toBe("https://milkmenot.com/results");
    });

    it("keeps the User-Agent and no other header", () => {
      expect(scrubEvent(event()).request?.headers).toEqual({ "User-Agent": "phone" });
    });

    it("sends a placeholder IP and nothing else about the user", () => {
      // Without a placeholder, Sentry locates the report by the address it
      // arrived from — down to the city — even with IP scrubbing on.
      expect(scrubEvent(event()).user).toEqual({ ip_address: "0.0.0.0" });
    });
  });
});
