import { Seo } from "@/components/Seo";
import {
  ArrowRight,
  Band,
  CrestDivider,
  Display,
  DropList,
  Kicker,
  Lede,
  MilkDrop,
  StoryCard,
  StoryLayout,
  StoryLinkButton,
} from "@/components/story";
import { AlertTriangle, CircleCheckBig, Download, FolderOpen, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { FaAndroid } from "react-icons/fa";

const ANDROID_DOWNLOAD_URL = "https://median.co/share/nmxqdbd#apk";

/**
 * No screenshots here on purpose — the real assets in `src/assets/install-guide/`
 * are placeholder illustrations (an iPhone in an Android guide, unrelated
 * sliders, a typo'd dialog) that would misrepresent what installing actually
 * looks like. A confident numbered sequence, plus the exact wording of the one
 * screen that alarms people, is the honest version of this page until real
 * captures exist.
 */
const STEPS: {
  icon: typeof Download;
  tone: "green" | "amber";
  title: string;
  body: string;
  quote?: string;
}[] = [
  {
    icon: Download,
    tone: "green",
    title: "Download the APK",
    body: "Tap the download button below. Your browser will likely flag the file as unrecognised — that's normal for anything that isn't from the Play Store.",
  },
  {
    icon: ShieldAlert,
    tone: "amber",
    title: "Allow this source once",
    body: 'Android interrupts the install with a warning like the one below. Tap Settings, then switch on "Allow from this source" for your browser or file manager — a one-time toggle.',
    quote: "For your security, your phone is not allowed to install unknown apps from this source.",
  },
  {
    icon: FolderOpen,
    tone: "green",
    title: "Open the downloaded file",
    body: "Pull down your notifications or open Downloads and tap the file named milk-me-not.apk to start installing.",
  },
  {
    icon: ShieldCheck,
    tone: "green",
    title: "Confirm the install",
    body: "Android shows a final check screen naming the app and what it can access. Tap Install and give it a few seconds.",
  },
  {
    icon: CircleCheckBig,
    tone: "green",
    title: "Open it and sign in",
    body: "Tap Open, or find Milk Me Not in your app drawer. Sign in and every rating you've made on the website is already there.",
  },
];

const ICON_TONE = {
  green: "bg-story-green-wash text-story-green-dark",
  amber: "bg-story-amber-light text-story-amber-dark",
} as const;

const InstallGuide = () => {
  return (
    <StoryLayout mobileCtaHint="Five steps. One expected warning.">
      <Seo
        title="Install guide — Milk Me Not"
        description="A step-by-step guide to installing the Milk Me Not Android APK, including the unknown-source warning Android shows and why it's expected."
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

            <Kicker>Installing on Android</Kicker>
            <Display as="h1" size="hero" className="mt-5 text-story-ink">
              Five taps, and one
              <br />
              <span className="text-story-green">warning you should expect.</span>
            </Display>
            <Lede className="mt-6 max-w-136">
              The whole thing takes about a minute. Here is every screen you will pass through, in order.
            </Lede>

            {/* The scary moment, named before it happens — and before the
                button. On a phone the grid collapses in DOM order, so this has
                to sit above the download or the warning arrives too late. */}
            <div className="story-hairline mt-8 flex gap-4 rounded-[1.25rem] bg-story-amber p-5 sm:p-6 lg:hidden">
              <AlertTriangle className="h-6 w-6 shrink-0 text-story-ink" strokeWidth={2.2} aria-hidden />
              <div>
                <h2 className="story-serif text-[1.15rem] font-bold text-story-ink">Expect this screen</h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-ink/75">
                  Android will stop partway to ask whether you trust the source. That is step 2 below, not a
                  sign to stop.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={ANDROID_DOWNLOAD_URL}
                download
                className="story-lift-green inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-story-green px-7 py-4 font-sans text-[1.0625rem] font-bold tracking-[-0.01em] text-story-ink no-underline transition-[filter] duration-150 hover:brightness-[1.07] active:scale-[0.985] sm:w-auto"
              >
                <Download className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
                Download the APK
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="story-hairline flex gap-4 rounded-[1.25rem] bg-story-amber p-6">
              <AlertTriangle className="h-6 w-6 shrink-0 text-story-ink" strokeWidth={2.2} aria-hidden />
              <div>
                <h2 className="story-serif text-[1.15rem] font-bold text-story-ink">Expect this screen</h2>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-ink/75">
                  Partway through, Android will block the install and name the source it doesn't recognise yet.
                  That is the phone's standard reaction to any app from outside the Play Store — it's step 2
                  below, not a sign to stop.
                </p>
              </div>
            </div>

            {/* Without this the right column stopped at a third of the left
                column's height and the fold read as unfinished. */}
            <div className="relative mt-6 overflow-hidden rounded-[1.25rem] bg-story-green-deep px-6 py-7">
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

      {/* ── The steps ────────────────────────────────────────────────── */}
      <Band ground="paper" size="lg" width="prose">
        <Kicker>The install, step by step</Kicker>
        <Display size="lg" className="mt-4 max-w-xl">
          Same five steps, every time
        </Display>

        <ol className="mt-12 flex flex-col">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-5 sm:gap-8">
              <div className="flex shrink-0 flex-col items-center">
                <span className="story-num flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-story-ink text-[1.05rem] text-story-cream sm:h-12 sm:w-12 sm:text-[1.15rem]">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span aria-hidden className="mt-2 w-px flex-1 bg-story-ink/15" />}
              </div>

              <div className={cnStep(i === STEPS.length - 1)}>
                <div className="flex items-start gap-4 sm:gap-5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ICON_TONE[step.tone]}`}
                  >
                    <step.icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="story-serif text-[1.35rem] font-bold text-story-ink">{step.title}</h3>
                    <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-story-muted">{step.body}</p>

                    {step.quote && (
                      <div className="mt-4 max-w-lg rounded-xl border-l-4 border-story-amber-dark bg-story-amber-light py-3 pl-4 pr-4">
                        <p className="story-kicker text-story-amber-dark">What the screen says</p>
                        <p className="story-serif mt-1.5 text-[0.9375rem] italic leading-snug text-story-ink">
                          "{step.quote}"
                        </p>
                        {/* Stock Android's wording. Samsung and other skins phrase
                            it differently, so we say so rather than overclaim. */}
                        <p className="mt-2 text-[0.75rem] font-medium text-story-amber-dark">
                          Wording varies a little between phone makers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Band>

      {/* ── Is this safe ─────────────────────────────────────────────── */}
      <Band ground="forest" size="lg">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 hidden text-story-green lg:block">
          <MilkDrop size={280} variant="solid" />
        </div>
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Kicker tone="light">The honest answer</Kicker>
            <Display size="xl" className="mt-5 text-white">
              Yes, it's safe.
              <br />
              <span className="text-story-green-light">Here's why we're sure.</span>
            </Display>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
              The warning you saw in step 2 is Android protecting you from apps it knows nothing about. This one
              it just hasn't met yet — not because anything is wrong with it.
            </p>
          </div>

          <DropList
            tone="light"
            className="lg:mt-2"
            items={[
              "The APK is built from the exact code we publish, signed by us — nothing is repackaged.",
              "It only ever comes from this page. We will never ask you to install it from a link elsewhere.",
              "Uninstalling it later is exactly like uninstalling any other app — long-press, remove.",
            ]}
          />
        </div>
      </Band>

      {/* ── iPhone + help ────────────────────────────────────────────── */}
      <Band ground="cream-2" size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <StoryCard className="story-lift p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
              <Smartphone className="h-6 w-6" strokeWidth={2.2} aria-hidden />
            </span>
            <h3 className="story-serif mt-4 text-[1.25rem] font-bold text-story-ink">Using an iPhone?</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-muted">
              There's no iOS app to install yet. Open milkmenot.com in Safari and add it to your home screen —
              scanning and rating both work there already.
            </p>
          </StoryCard>

          <StoryCard className="story-lift p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-story-green-wash text-story-green-dark">
              <FaAndroid className="h-6 w-6" />
            </span>
            <h3 className="story-serif mt-4 text-[1.25rem] font-bold text-story-ink">Still stuck?</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-story-muted">
              If the install won't go through, tell us where it stopped and we'll sort it out.
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
