import { Display, MilkDrop, StoryButton } from "@/components/story";

interface EmailConfirmationPendingProps {
  email: string;
  onBackToLogin: () => void;
}

/**
 * The gap between signing up and being able to rate anything. It should read as
 * one more step, not as a dead stop — so it says exactly what to do and what is
 * waiting on the other side.
 */
const EmailConfirmationPending = ({ email, onBackToLogin }: EmailConfirmationPendingProps) => (
  <div className="text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-story-green-wash text-story-green">
      <MilkDrop size={44} variant="solid" />
    </div>

    <Display size="md" className="mt-6">
      Check your email.
    </Display>

    <p className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
      We sent a confirmation link to{" "}
      <strong className="font-bold text-story-ink">{email}</strong>. Click it and your account is live.
    </p>

    <p className="mt-4 rounded-xl bg-story-cream-2 px-4 py-3 text-[0.8125rem] leading-relaxed text-story-muted">
      Nothing yet? Give it a minute, then check spam — plant milk newsletters have ruined it for all of us.
    </p>

    <StoryButton tone="outline" size="md" onClick={onBackToLogin} className="mt-6 w-full">
      Back to log in
    </StoryButton>
  </div>
);

export default EmailConfirmationPending;
