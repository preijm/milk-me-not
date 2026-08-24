import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchDeployedBuildId, isStaleBuild } from "./deployedBuild";

const responds = (body: string, ok = true, type = "application/json") =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status: ok ? 200 : 404, headers: { "content-type": type } })),
  );

describe("fetchDeployedBuildId", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads the id the build wrote", async () => {
    responds(JSON.stringify({ buildId: "a1b2c3d4e5f6" }));
    expect(await fetchDeployedBuildId()).toBe("a1b2c3d4e5f6");
  });

  it("answers null when the SPA fallback hands back the index page", async () => {
    // The assets Worker serves index.html with a 200 for anything it cannot
    // find, so a missing version.json looks like a successful request.
    responds("<!doctype html><html></html>");
    expect(await fetchDeployedBuildId()).toBeNull();
  });

  it("answers null for JSON of the wrong shape", async () => {
    responds(JSON.stringify({ version: "1.0.0" }));
    expect(await fetchDeployedBuildId()).toBeNull();
  });

  it("answers null for an empty id rather than treating it as a build", async () => {
    responds(JSON.stringify({ buildId: "" }));
    expect(await fetchDeployedBuildId()).toBeNull();
  });

  it("answers null on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    expect(await fetchDeployedBuildId()).toBeNull();
  });

  it("answers null on a non-ok response", async () => {
    responds("{}", false);
    expect(await fetchDeployedBuildId()).toBeNull();
  });

  it("asks the edge rather than the cache", async () => {
    responds(JSON.stringify({ buildId: "x" }));
    await fetchDeployedBuildId();
    const [url, init] = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toMatch(/^\/version\.json\?t=\d+$/);
    expect(init.cache).toBe("no-store");
  });
});

describe("isStaleBuild", () => {
  it("is stale when the deployed id differs", () => {
    expect(isStaleBuild("aaa", "bbb")).toBe(true);
  });

  it("is not stale when they agree", () => {
    expect(isStaleBuild("aaa", "aaa")).toBe(false);
  });

  it("is not stale when there was no answer", () => {
    // Offline must never be mistaken for a release.
    expect(isStaleBuild("aaa", null)).toBe(false);
  });

  it("is not stale when this bundle does not know what it is", () => {
    expect(isStaleBuild("unknown", "bbb")).toBe(false);
  });
});
