import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import AuthForm from "@/components/auth/AuthForm";
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";
import EmailConfirmationPending from "@/components/auth/EmailConfirmationPending";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useStoryHome, type HomeStory } from "@/components/home/useStoryHome";
import { peekPendingRating } from "@/lib/pendingRating";
import logoImg from "@/assets/logo-96.png";
import { Display, DropList, Kicker, MilkDrop, StoryHeader } from "@/components/story";

/**
 * The three headline figures. One implementation, rendered in two slots: above
 * the form on a phone, and under the sell points in the left column on desktop.
 * Display is left to the caller so the two placements hide independently.
 */
const Stats = ({ data, className = "" }: { data: HomeStory; className?: string }) => (
  <dl className={"max-w-md grid-cols-3 gap-6 " + className}>
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
);

/**
 * Every call to action on the site lands here, so this page is the last beat of
 * the pitch rather than a detour away from it. The form is one half; the other
 * half keeps saying what they are joining and what happens next.
 *
 * It deliberately does not use StoryLayout: the shared footer ends with a
 * "start rating" band and the sticky mobile bar carries the same ask, and
 * pointing a visitor at the rating flow while they are filling in the form to
 * reach it is noise.
 *
 * It carries no footer of its own either. The hand-rolled one here listed Home,
 * Discover, About and Contact — three of which the header already offers, and
 * all four of which are exits from the single form this page exists to get
 * completed. ResetPassword, the sibling with this same layout, has none.
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
          <div className="relative order-1 lg:col-start-1 lg:row-start-1">
            {/* Pale, and clear of the headline. This drop used to be
                `text-story-green` — the same token as the accent line below it —
                so "your opinion." was green on green and effectively invisible. */}
            <div aria-hidden className="pointer-events-none absolute -left-28 -top-52 hidden h-72 w-72 rounded-full bg-story-green-wash lg:block" />
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-56 hidden text-story-green-light lg:block">
              <MilkDrop size={220} variant="solid" />
            </div>

            <div className="relative">
              <Kicker>{heading.kicker}</Kicker>
              <Display as="h1" size="xl" className="mt-4">
                {heading.lead}
                <br />
                <span className="text-story-green">{heading.accent}</span>
              </Display>

              {pending?.label && (
                <p className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-story-green-wash px-4 py-2 text-[0.875rem] font-bold text-story-green-dark">
                  <img src={logoImg} alt="" className="h-5 w-5 rounded object-contain" width={20} height={20} />
                  Your rating for {pending.label} is waiting
                </p>
              )}

            </div>
          </div>

          {/* ── The proof, ahead of the ask on a phone ────────────────── */}
          {/* These numbers used to appear twice on a phone: paraphrased into a
              sentence inside a black slab above the form, then again as figures
              below it. The slab was also the only dark panel on a light page —
              full-strength `bg-story-ink` is a chip and avatar colour
              everywhere else. Same figures, same component, just placed where a
              phone needs them, so the evidence still lands before the ask. */}
          {data && (
            <div className="order-2 border-t border-story-ink/[0.08] pt-6 lg:hidden">
              <Stats data={data} className="grid" />
              <p className="mt-3 text-[0.8125rem] text-story-muted">No brand has ever paid for a point.</p>
            </div>
          )}

          {/* ── The form ──────────────────────────────────────────────── */}
          <div className="story-hairline story-lift order-3 rounded-[1.5rem] bg-white p-6 sm:p-8 lg:col-start-2 lg:row-start-1 lg:row-span-2">
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
          <div className="order-4 lg:col-start-1 lg:row-start-2">
            <DropList className="max-w-md" items={sellPoints} />
            {data && <Stats data={data} className="mt-8 hidden border-t border-story-ink/[0.08] pt-7 lg:grid" />}
          </div>
        </div>
      </main>

      <ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
};

export default Auth;
