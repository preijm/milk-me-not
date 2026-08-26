import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Who the app thinks you are.
 *
 * Everything gated on a signed-in user reads this, so a fault here is not one
 * broken screen — it is the wrong answer everywhere at once, and the two
 * plausible wrong answers fail in opposite directions. Report a session too
 * early and a signed-out reader briefly looks signed in. Report none and a
 * signed-in reader gets bounced off their own profile.
 *
 * It also owns the recovery flags in sessionStorage, which is where a reset
 * link's access token lives between arriving and being spent. Leaving one
 * behind after sign-out leaves a usable credential in the tab.
 */

const state = vi.hoisted(() => ({
  session: null as { user: { id: string; email?: string } } | null,
  sessionError: null as { message: string } | null,
  signOutError: null as { message: string } | null,
  /** The listener AuthContext registers, so tests can fire auth events at it. */
  listener: null as ((event: string, session: unknown) => void) | null,
  unsubscribes: 0,
  toasts: [] as { title?: string }[],
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (t: { title?: string }) => state.toasts.push(t) }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: state.session }, error: state.sessionError }),
      signOut: async () => ({ error: state.signOutError }),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        state.listener = cb;
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                state.unsubscribes += 1;
              },
            },
          },
        };
      },
    },
  },
}));

const { AuthProvider, useAuth } = await import("./AuthContext");

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const mount = async () => {
  const rendered = renderHook(() => useAuth(), { wrapper });
  // The bootstrap is async; everything below reads state after it settles.
  await waitFor(() => expect(rendered.result.current.initialized).toBe(true));
  return rendered;
};

const fire = async (event: string, session: unknown) => {
  await act(async () => {
    state.listener?.(event, session);
  });
};

const SESSION = { user: { id: "u1", email: "peter@example.com" } };

describe("AuthContext", () => {
  beforeEach(() => {
    state.session = null;
    state.sessionError = null;
    state.signOutError = null;
    state.listener = null;
    state.unsubscribes = 0;
    state.toasts = [];
    sessionStorage.clear();
    window.location.hash = "";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("refuses to be used outside a provider", async () => {
    // Without this guard the consumer reads undefined and fails somewhere far
    // less obvious than here.
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });

  describe("starting up", () => {
    it("is not loading on the very first paint", async () => {
      // `loading` starts false deliberately, so the header does not flash on
      // every page load. That is a fact about the first render, before any
      // effect has run — reading it after the bootstrap settles would pass
      // whatever the initial value had been, so a child records what it saw.
      const seen: boolean[] = [];
      const Probe = () => {
        seen.push(useAuth().loading);
        return null;
      };

      render(
        <AuthProvider>
          <Probe />
        </AuthProvider>,
      );

      expect(seen[0]).toBe(false);
      await waitFor(() => expect(seen).toContain(true));
    });

    it("finishes, and says so through initialized rather than loading", async () => {
      // Two different questions: `loading` is whether work is in flight,
      // `initialized` is whether the answer can be trusted yet. Anything
      // turning a null user into a redirect has to wait on the second.
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.initialized).toBe(false);

      await waitFor(() => expect(result.current.initialized).toBe(true));
      expect(result.current.loading).toBe(false);
    });

    it("reports nobody when there is no session", async () => {
      const { result } = await mount();

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it("picks up a session that already existed", async () => {
      state.session = SESSION;
      const { result } = await mount();

      expect(result.current.user?.id).toBe("u1");
    });

    it("settles on nobody when the session lookup fails", async () => {
      // Not a crash and not a stale user: a failed lookup means signed out,
      // and `initialized` still has to become true or the app waits forever.
      state.sessionError = { message: "network" };
      const { result } = await mount();

      expect(result.current.user).toBeNull();
      expect(result.current.initialized).toBe(true);
    });

    it("stops listening when it goes away", async () => {
      // A listener left behind keeps writing state into an unmounted tree.
      const { unmount } = await mount();
      unmount();

      expect(state.unsubscribes).toBe(1);
    });
  });

  describe("auth events", () => {
    it("takes on a user who signs in", async () => {
      const { result } = await mount();
      await fire("SIGNED_IN", SESSION);

      expect(result.current.user?.id).toBe("u1");
    });

    it("lets go of one who signs out", async () => {
      state.session = SESSION;
      const { result } = await mount();

      await fire("SIGNED_OUT", null);

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it("throws the recovery token away on sign out", async () => {
      // It is a live credential. Leaving it in sessionStorage means the next
      // person at this tab can still spend the reset link.
      sessionStorage.setItem("passwordRecoveryMode", "true");
      sessionStorage.setItem("passwordRecoveryAccessToken", "token");
      await mount();

      await fire("SIGNED_OUT", null);

      expect(sessionStorage.getItem("passwordRecoveryMode")).toBeNull();
      expect(sessionStorage.getItem("passwordRecoveryAccessToken")).toBeNull();
    });

    it("remembers a recovery event so the reset form knows to appear", async () => {
      await mount();
      await fire("PASSWORD_RECOVERY", SESSION);

      expect(sessionStorage.getItem("passwordRecoveryMode")).toBe("true");
    });
  });

  describe("a reset link in the address bar", () => {
    it("is recognised without waiting for an event", async () => {
      // Some environments hand back an access token with an empty refresh
      // token and never fire PASSWORD_RECOVERY at all. Reading the hash is
      // what makes those links work.
      window.location.hash = "#access_token=abc123&type=recovery";
      await mount();

      expect(sessionStorage.getItem("passwordRecoveryMode")).toBe("true");
      expect(sessionStorage.getItem("passwordRecoveryAccessToken")).toBe("abc123");
    });

    it("ignores a hash that is not a recovery link", async () => {
      window.location.hash = "#type=signup&access_token=abc123";
      await mount();

      expect(sessionStorage.getItem("passwordRecoveryMode")).toBeNull();
    });

    it("ignores a recovery type with no token", async () => {
      window.location.hash = "#type=recovery";
      await mount();

      expect(sessionStorage.getItem("passwordRecoveryMode")).toBeNull();
    });
  });

  describe("signing out", () => {
    it("clears the user", async () => {
      state.session = SESSION;
      const { result } = await mount();

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
    });

    it("says so when it could not, rather than pretending", async () => {
      // Reporting a sign-out that did not happen leaves a live session behind
      // a signed-out-looking screen.
      state.session = SESSION;
      state.signOutError = { message: "network" };
      const { result } = await mount();

      await act(async () => {
        await result.current.signOut();
      });

      expect(state.toasts.at(-1)?.title).toMatch(/error signing out/i);
      expect(result.current.user?.id).toBe("u1");
    });
  });
});
