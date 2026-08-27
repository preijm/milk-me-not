import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthForm from "./AuthForm";

/**
 * Google and the email form share one page, but they used to share one
 * `loading` flag too — clicking Google put "One moment…" on the password
 * submit button as well, as if it were the one doing something.
 */

const state = vi.hoisted(() => ({
  oauthResolve: null as (() => void) | null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: () =>
        new Promise((resolve) => {
          state.oauthResolve = () => resolve({ error: null });
        }),
    },
    rpc: async () => ({ data: false }),
  },
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ refreshAuth: async () => {} }),
}));

describe("AuthForm", () => {
  it("only the Google button goes into its own loading state, not the password submit", () => {
    render(
      <AuthForm isLogin onToggleMode={() => {}} onForgotPassword={() => {}} />,
    );

    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    const submitButton = screen.getByRole("button", { name: /log in and keep rating/i });

    fireEvent.click(googleButton);

    expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();
    // Disabled so it can't race the Google redirect, but its own label is untouched.
    expect(submitButton).toHaveTextContent(/log in and keep rating/i);
    expect(submitButton).toBeDisabled();
  });
});
