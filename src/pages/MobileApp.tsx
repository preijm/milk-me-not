import { cn } from "@/lib/utils";
import { Seo } from "@/components/Seo";
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
import { Download, Clock, ShieldCheck, FileCode, Smartphone } from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";

const ANDROID_DOWNLOAD_URL = "https://median.co/share/nmxqdbd#apk";

/**
 * The moment this page sells: not "an app exists" but the specific relief of
 * standing in the aisle, phone out, not typing anything. Three short steps,
 * framed against the alternative (typing a product name into the website).
 */
const AISLE_STEPS = [
  {
    n: "01",
    title: "Point it at the barcode",
    body: "The scanner opens straight to the camera. No search box, no keyboard — just aim it at the carton in your hand.",
  },
  {
    n: "02",
    title: "See what everyone else thought",
    body: "If it has been scored before, the verdict is on screen before you have put the carton back on the shelf.",
  },
  {
    n: "03",
    title: "Add your own in one thumb",
    body: "Drag a score, tap done. Ninety seconds, and the next person in this aisle gets to trust it.",
  },
];

const HONESTY_POINTS = [
  {
    icon: FileCode,
    title: "It's the same app",
    body: "The APK is built from the same code we ship, signed by us. Nothing is repackaged or reassembled along the way.",
  },
  {
    icon: ShieldCheck,
    title: "One source, on purpose",
    body: "It is not on the Play Store yet — that review takes time we have preferred to spend on the app. Download it only from this page.",
  },
  {
    icon: Smartphone,
    title: "Android will ask first",
    body: 'You will see an "unknown source" warning before install. That is Android being careful, not a sign something is wrong.',
  },
];

/** A download CTA has to be a real anchor (right-click, save-as, no JS
 * needed) — StoryLinkButton is bound to react-router's Link and can't target
 * an external file, so this repeats StoryButton's look on a plain `<a>`. */
const DownloadApkButton = ({
  tone = "green",
  children,
  className,
}: {
  tone?: "green" | "paper";
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    href={ANDROID_DOWNLOAD_URL}
    download
    className={cn(
      "inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 font-sans text-[1.0625rem] font-bold tracking-[-0.01em] no-underline transition-[transform,filter,background-color,color] duration-150 active:scale-[0.985] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-story-green",
      tone === "green" && "bg-story-green text-story-ink story-lift-green hover:brightness-[1.07]",
      tone === "paper" && "bg-white text-story-ink shadow-[0_10px_26px_-14px_rgba(27,36,33,0.5)] hover:bg-story-cream",
      className,
    )}
  >
    <Download className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
    {children}
  </a>
);

const MobileApp = () => {
  return (
    <StoryLayout transparentHeader mobileCtaHint="Direct APK · installs in under a minute">
      <Seo
        title="Android app — Milk Me Not"
        description="Download the Milk Me Not Android app. Scan a barcode, see the community verdict, rate it in seconds — without typing a thing."
        path="/mobile-app"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero" className="pt-6 sm:pt-10">
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <Kicker>Android · direct APK, not the Play Store</Kicker>

            <Display as="h1" size="hero" className="mt-5 text-story-ink">
              Rate it before
              <br />
              <span className="text-story-green-dark">you leave the aisle.</span>
            </Display>

            <Lede className="mt-6 max-w-136">
              Scan the barcode, see the verdict, add your score — all without pulling up a browser or typing a
              product name. That's the whole app.
            </Lede>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <DownloadApkButton className="w-full sm:w-auto">Download the APK</DownloadApkButton>
              <StoryLinkButton to="/install-guide" tone="outline" className="w-full sm:w-auto">
                How installing works
                <ArrowRight />
              </StoryLinkButton>
            </div>

            <p className="mt-5 text-[0.8125rem] font-medium text-story-muted-2">
              Not on Google Play yet — straight from us to your phone. We explain why below.
            </p>
          </div>

          {/* Desktop: the app's actual job, drawn as a phone mid-scan, cropped
              across a solid green disc the way Home's verdict card is. Kept off
              the mobile hero entirely so it never lands on the headline. */}
          <div className="relative hidden lg:block lg:min-h-104">
            <div aria-hidden className="absolute -right-8 top-0 h-104 w-104 rounded-full bg-story-green" />
            <div aria-hidden className="pointer-events-none absolute -left-4 bottom-6 text-story-blue opacity-90">
              <MilkDrop size={90} variant="solid" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanPhone className="relative h-96 w-auto drop-shadow-[0_30px_50px_rgba(27,36,33,0.28)]" />
            </div>
          </div>
        </div>
      </Band>

      <div className="text-story-paper">
        <CrestDivider className="block h-12 w-full sm:h-20" />
      </div>

      {/* ── What it's actually for ───────────────────────────────────── */}
      <Band ground="forest" size="lg">
        <div className="relative max-w-2xl">
          <Kicker tone="light">Why it exists</Kicker>
          <Display size="xl" className="mt-5 text-white">
            The website is for browsing.
            <br />
            <span className="text-story-green-light">The app is for the aisle.</span>
          </Display>
        </div>

        <ol className="relative mt-12 grid gap-8 sm:mt-16 lg:grid-cols-3 lg:gap-10">
          {AISLE_STEPS.map((step) => (
            <li key={step.n} className="border-t border-white/15 pt-6">
              <span className="story-num block text-[2.5rem] leading-none text-story-green-light">{step.n}</span>
              <h3 className="story-serif mt-4 text-[1.35rem] font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-story-cream/80">{step.body}</p>
            </li>
          ))}
        </ol>
      </Band>

      {/* ── Get it ───────────────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <Kicker>Get it</Kicker>
        <Display size="lg" className="mt-4 max-w-xl">
          One platform live, one on the way
        </Display>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {/* Android — the real, working tile. Full brand green, not a tint. */}
          <StoryCard className="story-lift relative overflow-hidden bg-story-green p-7 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 text-story-ink/[0.12]">
              <MilkDrop size={210} variant="solid" />
            </div>
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-story-ink/12 text-story-ink">
                  <FaAndroid className="h-7 w-7" />
                </span>
                <h3 className="story-serif mt-5 text-[1.5rem] font-bold text-story-ink">Android</h3>
                <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-story-ink">
                  Direct APK download. Works on any Android phone, no Play Store account needed.
                </p>
              </div>
              {/* QR code: pointless to scan on the phone reading this page,
                  so it only shows where scanning-from-another-device makes sense. */}
              <div className="hidden shrink-0 rounded-2xl bg-white p-3 lg:block">
                <QRCodeSVG value={ANDROID_DOWNLOAD_URL} size={104} level="M" />
                <p className="story-kicker mt-2 text-center text-[0.5625rem] text-story-muted-2">Scan on your phone</p>
              </div>
            </div>

            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <DownloadApkButton tone="paper" className="w-full sm:w-auto">
                Download APK
              </DownloadApkButton>
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-story-ink/30 px-6 py-4 text-[0.9375rem] font-bold text-story-ink sm:w-auto">
                <Clock className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
                Google Play — coming soon
              </span>
            </div>
          </StoryCard>

          {/* iPhone — honest about the gap, points at the fallback that works today. */}
          <StoryCard className="relative overflow-hidden bg-story-ink p-7 sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
              <FaApple className="h-7 w-7" />
            </span>
            <h3 className="story-serif mt-5 text-[1.5rem] font-bold text-white">iPhone</h3>
            <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-story-cream/80">
              No iOS app yet. The website carries the whole rating flow on Safari — scanning included — so nothing
              is missing but the app icon.
            </p>
            <StoryLinkButton to="/results" tone="outline-light" size="md" className="relative mt-7">
              Use it in Safari
              <ArrowRight />
            </StoryLinkButton>
          </StoryCard>
        </div>
      </Band>

      {/* ── Why the APK is safe ──────────────────────────────────────── */}
      <Band ground="amber" size="lg">
        <div className="max-w-2xl">
          <Kicker>Straight talk</Kicker>
          <Display size="lg" className="mt-4 text-story-ink">
            It's not sketchy. It's just not in a store yet.
          </Display>
          <Lede className="mt-4">
            An APK from outside the Play Store is exactly how Android expects you to feel a little cautious. Here
            is why this one is fine.
          </Lede>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {HONESTY_POINTS.map((p) => (
            <StoryCard as="li" key={p.title} className="flex flex-col gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-story-amber-light text-story-amber-dark">
                <p.icon className="h-5 w-5" strokeWidth={2.2} aria-hidden />
              </span>
              <h3 className="story-serif text-[1.15rem] font-bold text-story-ink">{p.title}</h3>
              <p className="text-[0.875rem] leading-relaxed text-story-muted">{p.body}</p>
            </StoryCard>
          ))}
        </ul>

        <StoryLinkButton to="/install-guide" tone="ink" size="md" className="mt-9">
          Walk me through installing it
          <ArrowRight />
        </StoryLinkButton>
      </Band>
    </StoryLayout>
  );
};

/**
 * A phone mid-scan: the app's actual job, drawn flat in the same currentColor
 * style as the shared motifs, kept local because nothing else on the site
 * needs a device illustration.
 */
const ScanPhone = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 220 400" fill="none" className={className} aria-hidden>
    <rect x="6" y="6" width="208" height="388" rx="34" fill="#1b2421" />
    <rect x="16" y="20" width="188" height="360" rx="24" fill="#f3ede1" />
    <rect x="16" y="20" width="188" height="66" rx="24" fill="#00bf63" />
    <rect x="16" y="62" width="188" height="24" fill="#00bf63" />
    <circle cx="110" cy="53" r="16" fill="#fff" fillOpacity="0.9" />
    <path d="M103 53h14M110 46v14" stroke="#00bf63" strokeWidth="3.4" strokeLinecap="round" />
    <rect x="40" y="120" width="140" height="140" rx="18" fill="#fff" stroke="#1b2421" strokeWidth="2.4" />
    <g stroke="#1b2421" strokeWidth="5" strokeLinecap="round">
      <path d="M58 138v18M67 138v18M79 138v18M86 138v10M97 138v18M110 138v18M120 138v10M129 138v18M141 138v18M150 138v10M160 138v18" />
    </g>
    <rect x="48" y="185" width="124" height="3" rx="1.5" fill="#00bf63" />
    <rect x="48" y="228" width="124" height="3" rx="1.5" fill="#00bf63" opacity="0.5" />
    <path d="M40 128v-8a8 8 0 0 1 8-8h8" stroke="#00bf63" strokeWidth="5" strokeLinecap="round" />
    <path d="M180 128v-8a8 8 0 0 0-8-8h-8" stroke="#00bf63" strokeWidth="5" strokeLinecap="round" />
    <path d="M40 252v8a8 8 0 0 0 8 8h8" stroke="#00bf63" strokeWidth="5" strokeLinecap="round" />
    <path d="M180 252v8a8 8 0 0 1-8 8h-8" stroke="#00bf63" strokeWidth="5" strokeLinecap="round" />
    <rect x="60" y="292" width="100" height="34" rx="17" fill="#2144ff" />
    <text x="110" y="315" textAnchor="middle" fontSize="17" fontWeight="800" fill="#fff" fontFamily="Manrope, sans-serif">
      8.7 · Gem
    </text>
  </svg>
);

export default MobileApp;
