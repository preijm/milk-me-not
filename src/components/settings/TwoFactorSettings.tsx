import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { StoryButton } from "@/components/story/primitives";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Enrolling = { factorId: string; qr: string; secret: string };

export const CodeInput = ({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => (
  <InputOTP maxLength={6} value={value} onChange={onChange} disabled={disabled} autoFocus inputMode="numeric">
    <InputOTPGroup>
      {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
    </InputOTPGroup>
  </InputOTP>
);

/**
 * Optional authenticator-app sign-in, offered to admins only.
 *
 * Supabase has no backup codes, so a lost phone is recovered by the other
 * admin deleting the factor from the dashboard (Authentication → Users).
 */
export default function TwoFactorSettings() {
  const [factorId, setFactorId] = useState<string | null | undefined>(undefined);
  const [enrolling, setEnrolling] = useState<Enrolling | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = () =>
    supabase.auth.mfa.listFactors().then(({ data }) => setFactorId(data?.totp[0]?.id ?? null));

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => setFactorId(data?.totp[0]?.id ?? null));
  }, []);

  const fail = (error: unknown) =>
    toast({ title: "Error", description: (error as Error).message, variant: "destructive" });

  const start = async () => {
    setBusy(true);
    try {
      // A setup abandoned halfway leaves an unverified factor behind, and a
      // second enroll next to it is refused. Clear them out first.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const f of factors?.all ?? []) {
        if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app" });
      if (error) throw error;
      setEnrolling({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!enrolling) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrolling.factorId, code });
      if (error) throw error;
      toast({ title: "Two-step sign-in is on", description: "You'll be asked for a code each time you sign in." });
      setEnrolling(null);
      setCode("");
      await load();
    } catch (error) {
      fail(error);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    if (!factorId) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      // Drop the aal2 claim from the session so nothing keeps asking for it.
      await supabase.auth.refreshSession();
      toast({ title: "Two-step sign-in is off" });
      await load();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  if (factorId === undefined) {
    return <p className="text-[0.875rem] text-story-muted">Checking…</p>;
  }

  if (enrolling) {
    return (
      <div className="space-y-4">
        <p className="text-[0.875rem] text-story-ink-2">
          Scan this with an authenticator app (Google Authenticator, 1Password, Authy…), then enter the
          6-digit code it shows.
        </p>
        <img src={enrolling.qr} alt="QR code for your authenticator app" className="h-44 w-44 rounded-lg bg-white" />
        <p className="text-[0.8125rem] text-story-muted">
          Can't scan? Enter this key instead:{" "}
          <code className="break-all font-mono text-story-ink">{enrolling.secret}</code>
        </p>
        <CodeInput value={code} onChange={setCode} disabled={busy} />
        <div className="flex flex-wrap gap-2">
          <StoryButton size="sm" onClick={confirm} disabled={busy || code.length !== 6}>
            {busy ? "Checking…" : "Turn on"}
          </StoryButton>
          <StoryButton size="sm" tone="outline" onClick={() => { setEnrolling(null); setCode(""); }} disabled={busy}>
            Cancel
          </StoryButton>
        </div>
      </div>
    );
  }

  return factorId ? (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark">
        <ShieldCheck className="h-5 w-5" /> On, with an authenticator app
      </p>
      <StoryButton size="sm" tone="outline" onClick={turnOff} disabled={busy}>
        Turn off
      </StoryButton>
    </div>
  ) : (
    <StoryButton size="sm" onClick={start} disabled={busy}>
      <ShieldCheck className="mr-2 h-4 w-4" />
      Set up an authenticator app
    </StoryButton>
  );
}
