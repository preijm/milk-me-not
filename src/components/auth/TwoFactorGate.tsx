import { ReactNode, useEffect, useState } from "react";
import { StoryButton } from "@/components/story/primitives";
import { CodeInput } from "@/components/settings/TwoFactorSettings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Asks for the authenticator code when a signed-in account has two-step
 * sign-in turned on but this session has not supplied it yet.
 *
 * It sits around the routes rather than inside the sign-in form so that one
 * check covers email, Google and a session restored from storage alike — the
 * Google path returns through a redirect the form never sees.
 *
 * This only stops the website. What stops the API is is_admin(), which refuses
 * an aal1 session for any admin with a verified factor
 * (20261006210000_admin_two_step_sign_in.sql).
 */
export const TwoFactorGate = ({ children }: { children: ReactNode }) => {
  const { session, signOut, refreshAuth } = useAuth();
  // Keyed by token, so a stale answer from the previous session never counts.
  const [checked, setChecked] = useState<{ token: string; needsCode: boolean } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const token = session?.access_token;
  useEffect(() => {
    if (!token) return;
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setChecked({ token, needsCode: data?.currentLevel === "aal1" && data?.nextLevel === "aal2" });
    });
  }, [token]);

  const needsCode = !!token && checked?.token === token && checked.needsCode;
  if (!needsCode) return <>{children}</>;

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data } = await supabase.auth.mfa.listFactors();
    const factorId = data?.totp[0]?.id;
    const { error } = factorId
      ? await supabase.auth.mfa.challengeAndVerify({ factorId, code })
      : { error: new Error("No authenticator app found on this account.") };
    setBusy(false);
    if (error) {
      setError("That code didn't work. Codes change every 30 seconds — try the current one.");
      setCode("");
      return;
    }
    await refreshAuth();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-story-cream px-4">
      <form onSubmit={verify} className="story-hairline w-full max-w-sm rounded-2xl bg-white p-6">
        <p className="story-kicker text-story-green-dark">Two-step sign-in</p>
        <h1 className="story-serif mt-1 text-[1.5rem] font-bold text-story-ink">Enter your code</h1>
        <p className="mt-1 text-[0.875rem] text-story-muted">The 6-digit code from your authenticator app.</p>
        <div className="mt-5">
          <CodeInput value={code} onChange={setCode} disabled={busy} />
        </div>
        {error && <p role="alert" className="mt-3 text-[0.8125rem] font-medium text-story-ink-2">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <StoryButton type="submit" size="sm" disabled={busy || code.length !== 6}>
            {busy ? "Checking…" : "Continue"}
          </StoryButton>
          <StoryButton type="button" size="sm" tone="outline" onClick={signOut} disabled={busy}>
            Sign out
          </StoryButton>
        </div>
      </form>
    </div>
  );
};
