import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { StoryButton } from "@/components/story/primitives";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateRecoveryCodes, recoveryCodesRemaining } from "@/lib/recoveryCodes";

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
 * Turning it on also hands out ten recovery codes, shown once. One of them,
 * entered at the code prompt, removes the authenticator so a lost phone does
 * not lock anyone out (see src/lib/recoveryCodes.ts).
 */
export default function TwoFactorSettings() {
  const [factorId, setFactorId] = useState<string | null | undefined>(undefined);
  const [enrolling, setEnrolling] = useState<Enrolling | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  // Plain text, held only until the reader says they have saved them.
  const [codes, setCodes] = useState<string[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const id = data?.totp[0]?.id ?? null;
    setFactorId(id);
    setRemaining(id ? await recoveryCodesRemaining() : null);
  };

  useEffect(() => {
    // Inline rather than load(): the lint rule wants state set in a callback.
    supabase.auth.mfa.listFactors().then(async ({ data }) => {
      const id = data?.totp[0]?.id ?? null;
      setFactorId(id);
      setRemaining(id ? await recoveryCodesRemaining() : null);
    });
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
      // The session is aal2 now, which is what generating codes requires. A
      // failure here must not undo the success above: the app is on, and
      // codes can be made later from this section.
      setCodes(await generateRecoveryCodes().catch((e) => (fail(e), null)));
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

  const makeNewCodes = async () => {
    setBusy(true);
    try {
      setCodes(await generateRecoveryCodes());
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  const doneWithCodes = async () => {
    setCodes(null);
    await load();
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

  if (codes) {
    return (
      <div className="space-y-4">
        <p className="text-[0.875rem] text-story-ink-2">
          <strong>Save these recovery codes</strong> somewhere other than your phone, such as a password
          manager. If you lose the phone, one of them turns two-step sign-in off so you can get back in.
          Each works once, and they won't be shown again.
        </p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl bg-story-cream p-4 font-mono text-[0.9375rem] text-story-ink">
          {codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="flex flex-wrap gap-2">
          <StoryButton
            size="sm"
            tone="outline"
            onClick={() => navigator.clipboard.writeText(codes.join("\n")).then(() => toast({ title: "Copied" }))}
          >
            Copy
          </StoryButton>
          <StoryButton size="sm" onClick={doneWithCodes}>
            I've saved them
          </StoryButton>
        </div>
      </div>
    );
  }

  return factorId ? (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark">
          <ShieldCheck className="h-5 w-5" /> On, with an authenticator app
        </p>
        <StoryButton size="sm" tone="outline" onClick={turnOff} disabled={busy}>
          Turn off
        </StoryButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-story-ink/7 pt-4">
        <p className="text-[0.875rem] text-story-muted">
          {remaining ? `${remaining} recovery code${remaining === 1 ? "" : "s"} left` : "No recovery codes yet"}
        </p>
        <StoryButton size="sm" tone="outline" onClick={makeNewCodes} disabled={busy}>
          {remaining ? "Make new codes" : "Make recovery codes"}
        </StoryButton>
      </div>
    </div>
  ) : (
    <StoryButton size="sm" onClick={start} disabled={busy}>
      <ShieldCheck className="mr-2 h-4 w-4" />
      Set up an authenticator app
    </StoryButton>
  );
}
