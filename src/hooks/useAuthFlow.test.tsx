import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

/**
 * Setting a new password, and the six ways of failing to.
 *
 * Every rule here is an early `return` after a toast, which means a rule that
 * stops working is silent — the weak password is simply accepted. So none of
 * these assert on the toast. They assert that the password was never changed,
 * because that is the fact that matters and the toast is only how it is
 * explained.
 *
 * The recovery path is the other half. A reset link carries an access token in
 * the URL fragment, and there are two ways to spend it depending on whether
 * Supabase gave us a session with it. Getting that wrong locks someone out of
 * their own account, which is not a thing a redeploy fixes.
 */

const state = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  sessionError: null as { message: string } | null,
  updateUserError: null as { message: string } | null,
  hash: { type: null as string | null, accessToken: null as string | null },
  recoveryMode: false,
  storedToken: null as string | null,
  // One object, reused. react-router's useLocation returns a stable reference
  // per navigation; handing back a fresh literal each render would re-run the
  // mount effect on every render and make this a test of the mock.
  location: { state: null as unknown, pathname: "/auth" },
  // What actually happened.
  updateUserCalls: [] as { password?: string }[],
  recoveryTokenCalls: [] as { accessToken: string; password: string }[],
  signOutCalls: 0,
  cleared: 0,
  toasts: [] as { title?: string; description?: string }[],
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (t: { title?: string }) => state.toasts.push(t) }),
}));

vi.mock("react-router-dom", () => ({ useLocation: () => state.location }));

vi.mock("@/lib/auth/recovery", () => ({
  getRecoveryFromUrlHash: () => state.hash,
  setRecoveryMode: () => {
    state.recoveryMode = true;
  },
  clearRecoveryMode: () => {
    state.cleared += 1;
    state.recoveryMode = false;
  },
  isRecoveryMode: () => state.recoveryMode,
  getStoredRecoveryAccessToken: () => state.storedToken,
  updatePasswordWithRecoveryToken: async (p: { accessToken: string; password: string }) => {
    state.recoveryTokenCalls.push(p);
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: state.session },
        error: state.sessionError,
      }),
      updateUser: async (args: { password?: string }) => {
        state.updateUserCalls.push(args);
        return { error: state.updateUserError };
      },
      signOut: async () => {
        state.signOutCalls += 1;
        return { error: null };
      },
    },
  },
}));

const { useAuthFlow } = await import("./useAuthFlow");

/** Nothing changed the password, by either route. */
const passwordUnchanged = () => {
  expect(state.updateUserCalls).toHaveLength(0);
  expect(state.recoveryTokenCalls).toHaveLength(0);
};

const attempt = async (password: string, confirm = password) => {
  const { result } = renderHook(() => useAuthFlow());
  await act(async () => {
    await result.current.handlePasswordUpdate(password, confirm);
  });
  return result;
};

describe("useAuthFlow", () => {
  beforeEach(() => {
    state.session = { user: { id: "u1" } };
    state.sessionError = null;
    state.updateUserError = null;
    state.hash = { type: null, accessToken: null };
    state.recoveryMode = false;
    state.storedToken = null;
    state.location.state = null;
    state.updateUserCalls = [];
    state.recoveryTokenCalls = [];
    state.signOutCalls = 0;
    state.cleared = 0;
    state.toasts = [];
  });

  describe("refuses a password that does not meet the rules", () => {
    it("empty", async () => {
      await attempt("");
      passwordUnchanged();
    });

    it("the two boxes disagree", async () => {
      await attempt("Passw0rdish", "Passw0rdIsh");
      passwordUnchanged();
    });

    it("shorter than eight", async () => {
      await attempt("Ab1cdef");
      passwordUnchanged();
    });

    it("no lower case", async () => {
      await attempt("ABCDEFG1");
      passwordUnchanged();
    });

    it("no upper case", async () => {
      await attempt("abcdefg1");
      passwordUnchanged();
    });

    it("no digit", async () => {
      await attempt("Abcdefgh");
      passwordUnchanged();
    });

    it("says which rule was missed, rather than just refusing", async () => {
      await attempt("abcdefg1");
      expect(state.toasts.at(-1)?.description).toMatch(/uppercase/i);
    });
  });

  describe("accepts one that does", () => {
    it("changes the password through the session when there is one", async () => {
      await attempt("Abcdefg1");

      expect(state.updateUserCalls).toEqual([{ password: "Abcdefg1" }]);
      expect(state.recoveryTokenCalls).toHaveLength(0);
    });

    it("falls back to the recovery token when the link gave no session", async () => {
      // A reset link can arrive with an access token and no refresh token, so
      // there is no session to update through. The token is the only way in.
      state.session = null;
      state.storedToken = "recovery-token";

      await attempt("Abcdefg1");

      expect(state.recoveryTokenCalls).toEqual([
        { accessToken: "recovery-token", password: "Abcdefg1" },
      ]);
      expect(state.updateUserCalls).toHaveLength(0);
    });

    it("gives up rather than claiming success when there is neither", async () => {
      state.session = null;
      state.storedToken = null;

      const result = await attempt("Abcdefg1");

      passwordUnchanged();
      expect(result.current.isPasswordResetSuccess).toBe(false);
      expect(state.toasts.at(-1)?.title).toMatch(/error/i);
    });

    it("only forgets the recovery link once the password really changed", async () => {
      // Clearing it on a failed attempt would strand the reader: the link is
      // spent, the password is unchanged, and the form no longer works.
      state.updateUserError = { message: "nope" };

      const result = await attempt("Abcdefg1");

      expect(state.cleared).toBe(0);
      expect(result.current.isPasswordResetSuccess).toBe(false);
    });

    it("forgets it on success", async () => {
      const result = await attempt("Abcdefg1");

      expect(state.cleared).toBe(1);
      expect(result.current.isPasswordResetSuccess).toBe(true);
    });

    it("lets the reader try again after a failed attempt", async () => {
      state.updateUserError = { message: "nope" };
      const result = await attempt("Abcdefg1");

      await waitFor(() => expect(result.current.isResetting).toBe(false));
    });
  });

  describe("what the link in the email means", () => {
    it("shows the reset form when the URL says recovery", async () => {
      state.hash = { type: "recovery", accessToken: "abc" };

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => expect(result.current.isPasswordReset).toBe(true));
    });

    it("takes the token out of the address bar", async () => {
      // It is a live credential sitting in the URL fragment, and a reader who
      // copies the address to ask for help would be pasting their account.
      const replaceState = vi.spyOn(window.history, "replaceState");
      state.hash = { type: "recovery", accessToken: "abc" };

      renderHook(() => useAuthFlow());

      await waitFor(() => expect(replaceState).toHaveBeenCalled());
      replaceState.mockRestore();
    });

    it("signs a freshly confirmed account out, so they log in properly", async () => {
      state.hash = { type: "signup", accessToken: null };

      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => expect(result.current.isEmailConfirmed).toBe(true));
      expect(state.signOutCalls).toBe(1);
      expect(result.current.isPasswordReset).toBe(false);
    });

    it("does not offer the reset form to someone who just arrived", async () => {
      const { result } = renderHook(() => useAuthFlow());

      await waitFor(() => expect(result.current.isPasswordReset).toBe(false));
    });
  });
});
