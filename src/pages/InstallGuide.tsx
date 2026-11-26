import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { STATIC_SEO } from "@/lib/staticSeo";
import {
  ArrowRight,
  Band,
  CrestDivider,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  StoryCard,
  StoryLayout,
  StoryLinkButton,
} from "@/components/story";
import { CircleCheckBig, Compass, Download, Globe, Share, Smartphone, SquarePlus } from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";

/**
 * How to put milkmenot.com on a phone's home screen. This page used to walk
 * people through sideloading an APK; the home-screen app replaced that (see
 * `docs/deployment.md` on the service worker and `src/lib/installPrompt.ts`
 * for the banner that offers it).
 *
 * Wording follows what Chrome and Safari show today. Both vary a little
 * between versions and phone makers, so the steps name the alternative label
 * where there is one rather than overclaim one exact screen.
 */
type Step = { icon: typeof Download; title: string; body: string };

const ANDROID_STEPS: Step[] = [
  {
    icon: Globe,
    title: "Open milkmenot.com in Chrome",
    body: "Samsung Internet, Edge and Firefox can do it too, but Chrome is the smoothest.",
  },
  {
    icon: Download,
    title: "Tap Install",
    body: "A green bar at the top of the page offers it. If you closed that bar, open Chrome's ⋮ menu and tap Add to Home screen (on some phones it says Install app).",
  },
  {
    icon: CircleCheckBig,
    title: "Confirm, and it's on your home screen",
    body: "Chrome asks once more. Tap Install, and the Milk Me Not icon appears next to your other apps.",
  },
];

const IPHONE_STEPS: Step[] = [
  {
    icon: Compass,
    title: "Open milkmenot.com in Safari",
    body: "Safari is the surest route. Chrome and other iPhone browsers usually have it in their share menu too.",
  },
  {
    icon: Share,
    title: "Tap Share",
    body: "The square with an arrow pointing up. On an iPhone it sits in the bar at the bottom; on an iPad, at the top right.",
  },
  {
    icon: SquarePlus,
    title: "Tap Add to Home Screen, then Add",
    body: "Scroll down the share menu to find it. The Milk Me Not icon lands on your home screen straight away.",
  },
];

const StepList = ({ steps }: { steps: Step[] }) => (
  <ol className="mt-10 flex flex-col">
    {steps.map((step, i) => (
      <li key={step.title} className="relative flex gap-5 sm:gap-8">
        <div className="flex shrink-0 flex-col items-center">
          <span className="story-num flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-story-ink text-[1.05rem] text-story-cream sm:h-12 sm:w-12 sm:text-[1.15rem]">
            {i + 1}
          </span>
          {i < steps.length - 1 && <span aria-hidden className="mt-2 w-px flex-1 bg-story-ink/15" />}
        </div>

        <div className={cnStep(i === steps.length - 1)}>
          <div className="flex items-start gap-4 sm:gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
              <step.icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="story-serif text-[1.35rem] font-bold text-story-ink">{step.title}</h3>
              <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-story-muted">{step.body}</p>
            </div>
          </div>
        </div>
      </li>
    ))}
  </ol>
);

const InstallGuide = () => {
  const { hash } = useLocation();

  // /mobile-app links straight to #android or #iphone. ScrollToTop has already
  // sent the window to the top, and this lazy page was not in the DOM when the
  // browser looked for the anchor, so jump to it once it exists.
  useEffect(() => {
    if (hash === "#android" || hash === "#iphone") {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash]);

  return (
    <StoryLayout mobileCtaHint="Three taps, no app store">
      <Seo
        {...STATIC_SEO["/install-guide"]}
        path="/install-guide"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            <StoryLinkButton to="/mobile-app" tone="outline" size="sm" className="mb-6">
              <ArrowRight className="rotate-180" />
              Back to the app page
            </StoryLinkButton>

            <Kicker>Adding it to your home screen</Kicker>
            <Display as="h1" size="hero" className="mt-5 text-story-ink">
              Three taps,
              <br />
              <span className="text-story-green">no app store.</span>
            </Display>
            <Lede className="mt-6 max-w-136">
              Your browser can put Milk Me Not on your home screen as an app of its own. Pick your phone below.
            </Lede>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#android"
                className="story-lift-green inline-flex items-center justify-center gap-2.5 rounded-full bg-story-green px-7 py-4 font-sans text-[1.0625rem] font-bold tracking-[-0.01em] text-white no-underline transition-[filter] duration-150 hover:brightness-[1.07] active:scale-[0.985]"
              >
                <FaAndroid className="h-[18px] w-[18px]" aria-hidden />
                Android
              </a>
              <a
                href="#iphone"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-story-ink px-7 py-4 font-sans text-[1.0625rem] font-bold tracking-[-0.01em] text-story-cream no-underline transition-[filter] duration-150 hover:brightness-125 active:scale-[0.985]"
              >
                <FaApple className="h-[18px] w-[18px]" aria-hidden />
                iPhone and iPad
              </a>
            </div>
          </div>

          {/* Without this the right column stopped at a third of the left
              column's height and the fold read as unfinished. */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[1.25rem] bg-story-green-deep px-6 py-7">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 text-story-green">
                <MilkDrop size={170} variant="solid" />
              </div>
              <p className="story-kicker relative text-white/50">Once it's on</p>
              <p className="story-serif relative mt-2 max-w-[16rem] text-[1.25rem] font-bold leading-snug text-white">
                Scan a barcode in the aisle and rate it before you reach the till.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <div className="text-story-paper">
        <CrestDivider className="block h-12 w-full sm:h-20" />
      </div>

      {/* ── Android ──────────────────────────────────────────────────── */}
      <Band ground="paper" size="lg" width="prose">
        <section id="android" className="scroll-mt-24">
          <Kicker>Android</Kicker>
          <Display size="lg" className="mt-4 max-w-xl">
            In Chrome
          </Display>
          <StepList steps={ANDROID_STEPS} />
        </section>
      </Band>

      {/* ── iPhone ───────────────────────────────────────────────────── */}
      <Band ground="cream" size="lg" width="prose">
        <section id="iphone" className="scroll-mt-24">
          <Kicker>iPhone and iPad</Kicker>
          <Display size="lg" className="mt-4 max-w-xl">
            In Safari
          </Display>
          <StepList steps={IPHONE_STEPS} />
        </section>
      </Band>

      {/* ── Old app + help ───────────────────────────────────────────── */}
      <Band ground="cream-2" size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* People who sideloaded the old Android APK from this page. It
              loads the live site, so it keeps working; nothing forces a move. */}
          <StoryCard className="story-lift p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
              <Smartphone className="h-6 w-6" strokeWidth={2.2} aria-hidden />
            </span>
            <h3 className="story-serif mt-4 text-[1.25rem] font-bold text-story-ink">
              Installed our Android app before?
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-muted">
              It keeps working: it opens the same live site. You can keep it, or remove it and add the home-screen
              version instead. Your ratings live in your account, not on the phone.
            </p>
          </StoryCard>

          <StoryCard className="story-lift p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
              <CircleCheckBig className="h-6 w-6" strokeWidth={2.2} aria-hidden />
            </span>
            <h3 className="story-serif mt-4 text-[1.25rem] font-bold text-story-ink">Still stuck?</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-muted">
              Tell us which phone and browser you're on, and where it stopped. We'll sort it out.
            </p>
            <StoryLinkButton to="/contact" tone="outline" size="md" className="mt-5">
              Contact support
              <ArrowRight />
            </StoryLinkButton>
          </StoryCard>
        </div>
      </Band>
    </StoryLayout>
  );
};

/** Keeps the timeline's last item from trailing extra padding under the footer. */
const cnStep = (isLast: boolean) => `min-w-0 flex-1 pb-10 sm:pb-12 ${isLast ? "pb-2 sm:pb-2" : ""}`;

export default InstallGuide;
