import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import AuthForm from "@/components/auth/AuthForm";
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";
import EmailConfirmationPending from "@/components/auth/EmailConfirmationPending";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useStoryHome } from "@/components/home/useStoryHome";
import { peekPendingRating } from "@/lib/pendingRating";
import logoImg from "@/assets/logo-96.png";
import { Display, DropList, Kicker, MilkDrop, StoryHeader } from "@/components/story";

/**
 * Every call to action on the site lands here, so this page is the last beat of
 * the pitch rather than a detour away from it. The form is one half; the other
 * half keeps saying what they are joining and what happens next.
 *
 * It deliberately does not use StoryLayout: the shared footer ends with a
 * "start rating" band and the sticky mobile bar carries the same ask, and
 * pointing a visitor at the rating flow while they are filling in the form to
 * reach it is noise.
 */
const Auth = () => {
  const location = useLocation();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [emailPending, setEmailPending] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(() => (location.state as { mode?: string } | null)?.mode !== "signup");
  const { data } = useStoryHome();

  // Someone who scanned a shelf QR has a product waiting on the other side of
  // this form. Saying so is the difference between a detour and a step.
  const [pending] = useState(() => peekPendingRating());

  const {
    isPasswordReset,
    isEmailConfirmed,
    isEmailPending,
    userEmail,
    isResetting,
    setIsEmailConfirmed,
    setIsEmailPending,
    handlePasswordUpdate,
  } = useAuthFlow();

  useEffect(() => {
    const mode = (location.state as { mode?: string } | null)?.mode;
    if (mode === "signup") setIsLogin(false);
    if (mode === "login") setIsLogin(true);
  }, [location.state]);

  const shouldShowEmailPending = emailPending || isEmailPending;
  const pendingEmail = emailPending || userEmail;

  const heading = isPasswordReset
    ? { kicker: "Reset your password", lead: "New password", accent: "same milk." }
    : shouldShowEmailPending
      ? { kicker: "Almost in", lead: "Check your", accent: "inbox." }
      : isLogin
        ? { kicker: "Welcome back", lead: "The shelf missed", accent: "your opinion." }
        : { kicker: "Join in", lead: "Rate what you", accent: "actually drank." };

  const sellPoints = isPasswordReset
    ? [
        "Pick something you have not used anywhere else.",
        "Your ratings and notes are untouched — only the password changes.",
      ]
    : isLogin
    ? [
        "Pick up where you left off — your ratings are all still there.",
        "See every individual rating and tasting note behind a score.",
        "The world map of where each carton was actually drunk.",
      ]
    : [
        "Ninety seconds per rating. No photo required.",
        "Your score joins the community average immediately.",
        "Free forever, and no brand has ever paid us a cent.",
      ];

  return (
    <div className="story-surface flex min-h-dvh flex-col">
      <Seo
        title={isLogin ? "Log in — Milk Me Not" : "Create an account — Milk Me Not"}
        description="Join the community rating every plant milk on the shelf. Free forever, no brand deals, ninety seconds per rating."
        path="/auth"
        noindex
      />
      <StoryHeader hideCta />

      <main className="flex flex-1 items-center">
        {/* On a phone the order is pitch → form → proof, so a returning visitor
            reaches the form in one screen and a new one still gets sold first.
            On desktop the pitch and proof stack in the left column beside it. */}
        <div className="mx-auto grid w-full max-w-[76rem] items-start gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:px-10 lg:py-16">
          {/* ── The pitch ─────────────────────────────────────────────── */}
          <div className="relative lg:col-start-1 lg:row-start-1">
            <div aria-hidden className="pointer-events-none absolute -left-28 -top-20 hidden h-72 w-72 rounded-full bg-story-green-wash lg:block" />
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-14 hidden text-story-green lg:block">
              <MilkDrop size={210} variant="solid" />
            </div>

            <div className="relative">
              <Kicker>{heading.kicker}</Kicker>
              <Display as="h1" size="xl" className="mt-4">
                {heading.lead}
                <br />
                <span className="text-story-green">{heading.accent}</span>
              </Display>

              {/* One number above the form on a phone, so nobody is asked to
                  commit before seeing any evidence. The rest follows below. */}
              <div className="mt-5 rounded-[1.25rem] bg-story-ink px-4 py-3.5 lg:hidden">
                <p className="story-kicker text-white/45">Why bother</p>
                <p className="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-white">
                  {data
                    ? `${data.totalRatings} honest ratings across ${data.products} products.`
                    : "Hundreds of honest ratings."}{" "}
                  <span className="text-story-green-light">No brand has ever paid for a point.</span>
                </p>
              </div>

              {pending?.label && (
                <p className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-story-green-wash px-4 py-2 text-[0.875rem] font-bold text-story-green-dark">
                  <img src={logoImg} alt="" className="h-5 w-5 rounded object-contain" width={20} height={20} />
                  Your rating for {pending.label} is waiting
                </p>
              )}

            </div>
          </div>

          {/* ── The form ──────────────────────────────────────────────── */}
          <div className="story-hairline story-lift rounded-[1.5rem] bg-white p-6 sm:p-8 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            {shouldShowEmailPending ? (
              <EmailConfirmationPending
                email={pendingEmail}
                onBackToLogin={() => {
                  setEmailPending(null);
                  setIsEmailPending(false);
                }}
              />
            ) : isPasswordReset ? (
              <PasswordResetForm isResetting={isResetting} onPasswordUpdate={handlePasswordUpdate} />
            ) : (
              <AuthForm
                isLogin={isLogin}
                onToggleMode={() => setIsLogin((v) => !v)}
                onForgotPassword={() => setShowResetDialog(true)}
                isEmailConfirmed={isEmailConfirmed}
                onEmailConfirmedDismiss={() => setIsEmailConfirmed(false)}
                onEmailPending={setEmailPending}
              />
            )}

            <p className="mt-6 border-t border-story-ink/[0.08] pt-5 text-center text-[0.75rem] leading-relaxed text-story-muted-2">
              Plant milk, no spam — promise. Read{" "}
              <Link to="/faq" className="font-bold text-story-muted underline-offset-2 hover:underline">
                how ratings work
              </Link>{" "}
              first if you like.
            </p>
          </div>
          {/* ── The proof ─────────────────────────────────────────────── */}
          <div className="lg:col-start-1 lg:row-start-2">
            <DropList className="max-w-md" items={sellPoints} />
            {data && (
              <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-story-ink/[0.08] pt-7">
                {[
                  { value: data.totalRatings, label: "Ratings" },
                  { value: data.products, label: "Products" },
                  { value: data.brands, label: "Brands" },
                ].map((s) => (
                  <div key={s.label}>
                    <dd className="story-num text-[clamp(1.6rem,5vw,2.25rem)] leading-none text-story-ink">{s.value}</dd>
                    <dt className="story-kicker mt-1.5 text-story-muted-2">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-story-ink/[0.07] py-6">
        <nav className="mx-auto flex max-w-[76rem] flex-wrap justify-center gap-x-7 gap-y-2 px-5 text-[0.875rem] font-medium text-story-muted">
          <Link to="/" className="no-underline hover:text-story-ink">Home</Link>
          <Link to="/results" className="no-underline hover:text-story-ink">Discover</Link>
          <Link to="/about" className="no-underline hover:text-story-ink">About</Link>
          <Link to="/contact" className="no-underline hover:text-story-ink">Contact</Link>
        </nav>
      </footer>

      <ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
};

export default Auth;
