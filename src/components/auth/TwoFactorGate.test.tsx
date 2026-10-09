import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TwoFactorGate } from "./TwoFactorGate";

/**
 * The gate only steps in when the account has a factor (nextLevel aal2) and
 * this session has not used it yet (currentLevel aal1). Anyone without 2FA —
 * which is nearly everyone — must never see it.
 */

// input-otp probes for password-manager badges with this; jsdom lacks it.
document.elementFromPoint = () => null;

const state = vi.hoisted(() => ({
  aal: { currentLevel: "aal1", nextLevel: "aal1" },
  session: { access_token: "t" } as { access_token: string } | null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: state.aal, error: null }),
      },
    },
  },
}));

const redeem = vi.hoisted(() => vi.fn(async (_code: string) => true));
const refreshAuth = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("@/lib/recoveryCodes", () => ({ redeemRecoveryCode: redeem }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ session: state.session, signOut: async () => {}, refreshAuth }),
}));

const renderGate = () => render(<TwoFactorGate><p>the app</p></TwoFactorGate>);

describe("TwoFactorGate", () => {
  beforeEach(() => {
    state.session = { access_token: "t" };
  });

  it("asks for a code when the account has 2FA and the session has not used it", async () => {
    state.aal = { currentLevel: "aal1", nextLevel: "aal2" };
    renderGate();
    expect(await screen.findByText(/enter your code/i)).toBeInTheDocument();
    expect(screen.queryByText("the app")).not.toBeInTheDocument();
  });

  it("lets through an account without 2FA", async () => {
    state.aal = { currentLevel: "aal1", nextLevel: "aal1" };
    renderGate();
    expect(await screen.findByText("the app")).toBeInTheDocument();
    expect(screen.queryByText(/enter your code/i)).not.toBeInTheDocument();
  });

  it("lets through a session that already gave its code", async () => {
    state.aal = { currentLevel: "aal2", nextLevel: "aal2" };
    renderGate();
    expect(await screen.findByText("the app")).toBeInTheDocument();
  });

  it("takes a recovery code in place of the app's code", async () => {
    state.aal = { currentLevel: "aal1", nextLevel: "aal2" };
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /lost your phone/i }));
    fireEvent.change(screen.getByLabelText(/recovery code/i), { target: { value: "a1b2-c3d4-e5f6" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(refreshAuth).toHaveBeenCalled());
    expect(redeem).toHaveBeenCalledWith("a1b2-c3d4-e5f6");
  });

  it("lets through visitors who are not signed in", () => {
    state.session = null;
    renderGate();
    expect(screen.getByText("the app")).toBeInTheDocument();
  });
});
