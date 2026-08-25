import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

/**
 * Does the application still start?
 *
 * Nothing else in the suite asks that. 261 unit tests can pass while the app
 * fails to render at all — a provider removed from the tree, a circular import,
 * a module that throws at import time, a route element that is undefined. None
 * of those are type errors, none fail a lint, and `vite build` is happy to
 * produce a bundle that white-screens. This is the check that stands between a
 * green pull request and a blank page, which matters more now that a green
 * pull request merges itself.
 *
 * It deliberately asserts almost nothing about what is on the screen. Anything
 * to do with copy or layout belongs in a test about copy or layout, and would
 * make this fail for reasons that have nothing to do with booting. The question
 * here is only: did the shell mount, did the lazy route resolve, and did
 * anything land in <main>.
 */

/**
 * A chainable stand-in for a postgrest builder.
 *
 * Every method returns itself and the whole thing is awaitable, so it satisfies
 * `.from(x).select(y).order(z).limit(1).single()` and any other order the app
 * happens to use, without this file having to know which.
 */
const emptyResult = { data: [], error: null, count: 0 };
const makeChain = (): unknown => {
  const chain: unknown = new Proxy(function () {} as unknown as object, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (v: unknown) => unknown) => Promise.resolve(emptyResult).then(resolve);
      }
      return () => chain;
    },
    apply() {
      return chain;
    },
  });
  return chain;
};

const noSession = { data: { session: null }, error: null };
const noUser = { data: { user: null }, error: null };
const subscription = { data: { subscription: { unsubscribe: () => {} } } };

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => noSession,
      getUser: async () => noUser,
      onAuthStateChange: () => subscription,
      signOut: async () => ({ error: null }),
    },
    from: () => makeChain(),
    rpc: () => makeChain(),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
    removeChannel: () => {},
  },
}));

const { default: App } = await import("./App");

describe("the application boots", () => {
  beforeEach(() => {
    // The version check asks the edge what it is serving. Left unstubbed it is
    // an unhandled rejection in jsdom rather than a useful failure.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ buildId: "test" }))),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mounts without throwing", () => {
    // A component that throws while rendering takes this down, which is the
    // single most valuable thing in the file.
    expect(() => render(<App />)).not.toThrow();
  });

  it("renders a route into <main> rather than white-screening", async () => {
    render(<App />);

    // The shell is synchronous; the route behind it is lazy.
    const main = await screen.findByRole("main");

    await waitFor(
      () => {
        expect(main.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      },
      // Generous on purpose. This gates auto-merge now, so a slow runner
      // producing a red build would block every pull request in the queue —
      // and a longer ceiling costs nothing except on a genuine failure.
      { timeout: 15000 },
    );
  });
});
