import { Seo } from "@/components/Seo";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import {
  ArrowRight,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  StoryHeader,
  StoryLinkButton,
} from "@/components/story";

/**
 * Where the reset email lands.
 *
 * Same composition as the auth page — pitch on one side, the single job on the
 * other — because arriving here from an email is no reason to be dropped into a
 * different-looking website.
 */
const ResetPassword = () => {
  const { isPasswordReset, isPasswordResetSuccess, isResetting, handlePasswordUpdate } = useAuthFlow();

  const heading = isPasswordResetSuccess
    ? { kicker: "Done", lead: "Password", accent: "changed." }
    : isPasswordReset
      ? { kicker: "Almost there", lead: "Pick a new", accent: "password." }
      : { kicker: "Expired link", lead: "That link has", accent: "gone stale." };

  return (
    <div className="story-surface flex min-h-dvh flex-col">
      <Seo
        title="Reset your password — Milk Me Not"
        description="Set a new password for your Milk Me Not account."
        path="/reset-password"
        noindex
      />
      <StoryHeader hideCta />

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-304 items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:px-10">
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-64 hidden text-story-green-light lg:block">
              <MilkDrop size={240} variant="solid" />
            </div>
            <div className="relative">
              <Kicker>{heading.kicker}</Kicker>
              <Display as="h1" size="xl" className="mt-4">
                {heading.lead}
                <br />
                <span className="text-story-green">{heading.accent}</span>
              </Display>
              <Lede className="mt-5 max-w-md">
                {isPasswordResetSuccess
                  ? "Taking you back to the log-in page now."
                  : isPasswordReset
                    ? "Your ratings and notes are untouched — only the password changes."
                    : "Reset links expire after a while, and each one only works once. Ask for a fresh one and it will land in a minute or two."}
              </Lede>
            </div>
          </div>

          <div className="story-hairline story-lift rounded-3xl bg-white p-6 sm:p-8">
            {isPasswordResetSuccess ? (
              <p className="text-[0.9375rem] text-story-muted">Redirecting…</p>
            ) : isPasswordReset ? (
              <PasswordResetForm isResetting={isResetting} onPasswordUpdate={handlePasswordUpdate} />
            ) : (
              <div>
                <Display size="md">Ask for a new one.</Display>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
                  Head back to the log-in page and use “Forgot your password?”.
                </p>
                <StoryLinkButton to="/auth" size="md" className="mt-6 w-full">
                  Back to log in
                  <ArrowRight />
                </StoryLinkButton>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
