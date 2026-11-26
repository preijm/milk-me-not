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
import { RefreshCw, Trash2, UserCheck } from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";

/** Where the QR code sends a desktop visitor: the steps, on their phone. */
const INSTALL_GUIDE_URL = "https://milkmenot.com/install-guide";

/**
 * The moment this page sells: not "an app exists" but the specific relief of
 * standing in the aisle, phone out, not typing anything. Three short steps,
 * framed against the alternative (typing a product name into the website).
 */
const AISLE_STEPS = [
  {
    n: "01",
    title: "Point it at the barcode",
    body: "Tap the icon, open the scanner, aim it at the carton in your hand. No search box, no keyboard.",
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

/**
 * The home-screen app is the website in its own window, so these are the
 * things worth knowing, and every one of them is simply true of it. There is
 * no store, no APK and no unknown-source warning left to explain away.
 */
const PLAIN_FACTS = [
  {
    icon: UserCheck,
    title: "Same account, same ratings",
    body: "It is milkmenot.com with its own icon. Sign in once and everything you have rated is already there.",
  },
  {
    icon: RefreshCw,
    title: "Always the latest version",
    body: "Nothing to update. Whenever we ship something, the app on your home screen has it the next time you open it.",
  },
  {
    icon: Trash2,
    title: "Gone in one press",
    body: "Long-press the icon and remove it, like any other app. Your ratings stay in your account.",
  },
];

const MobileApp = () => {
  return (
    <StoryLayout transparentHeader mobileCtaHint="On your home screen in ten seconds">
      <Seo
        {...STATIC_SEO["/mobile-app"]}
        path="/mobile-app"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero" className="pt-6 sm:pt-10">
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <Kicker>Android and iPhone · no app store needed</Kicker>

            <Display as="h1" size="hero" className="mt-5 text-story-ink">
              Rate it before
              <br />
              <span className="text-story-green">you leave the aisle.</span>
            </Display>

            <Lede className="mt-6 max-w-136">
              Put Milk Me Not on your home screen. Scan the barcode, see the verdict, add your score — without
              opening a browser or typing a product name.
            </Lede>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StoryLinkButton to="/install-guide" tone="green" className="w-full sm:w-auto">
                Add it to your phone
                <ArrowRight />
              </StoryLinkButton>
            </div>

            <p className="mt-5 text-[0.8125rem] font-medium text-story-muted-2">
              Free, nothing to download from a store, and it takes about ten seconds.
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
          Works on both
        </Display>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {/* Android: full brand green, not a tint. */}
          <StoryCard className="story-lift relative overflow-hidden bg-story-green p-7 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 text-story-ink/[0.12]">
              <MilkDrop size={210} variant="solid" />
            </div>
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-story-ink/12 text-story-ink">
                <FaAndroid className="h-7 w-7" />
              </span>
              <h3 className="story-serif mt-5 text-[1.5rem] font-bold text-story-ink">Android</h3>
              <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-story-ink">
                Open milkmenot.com in Chrome and tap <strong>Install</strong> in the green bar at the top. No bar?
                The ⋮ menu has <strong>Add to Home screen</strong>.
              </p>
            </div>
            <StoryLinkButton to="/install-guide#android" tone="ink" size="md" className="relative mt-7">
              Show me the steps
              <ArrowRight />
            </StoryLinkButton>
          </StoryCard>

          <StoryCard className="relative overflow-hidden bg-story-ink p-7 sm:p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
              <FaApple className="h-7 w-7" />
            </span>
            <h3 className="story-serif mt-5 text-[1.5rem] font-bold text-white">iPhone and iPad</h3>
            <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-story-cream/80">
              Open milkmenot.com in Safari, tap <strong className="text-white">Share</strong>, then{" "}
              <strong className="text-white">Add to Home Screen</strong>.
            </p>
            <StoryLinkButton to="/install-guide#iphone" tone="outline-light" size="md" className="relative mt-7">
              Show me the steps
              <ArrowRight />
            </StoryLinkButton>
          </StoryCard>
        </div>

        {/* Pointless to scan on the phone reading this page, so desktop only. */}
        <div className="mt-8 hidden items-center gap-5 lg:flex">
          <div className="story-hairline shrink-0 rounded-2xl bg-white p-3">
            <QRCodeSVG value={INSTALL_GUIDE_URL} size={96} level="M" />
          </div>
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-story-muted">
            Reading this on a computer? Point your phone's camera at the code to open the steps there.
          </p>
        </div>
      </Band>

      {/* ── Plain facts ──────────────────────────────────────────────── */}
      <Band ground="amber" size="lg">
        <div className="max-w-2xl">
          <Kicker>Good to know</Kicker>
          <Display size="lg" className="mt-4 text-story-ink">
            It's the website, in its own window.
          </Display>
          <Lede className="mt-4">
            It opens full-screen from its own icon, like any other app. Underneath, it is the same Milk Me Not.
          </Lede>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {PLAIN_FACTS.map((p) => (
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
          Walk me through it
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
