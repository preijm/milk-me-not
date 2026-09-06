import { Link } from "react-router-dom";
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
  ScoreMark,
  SectionHead,
  StoryButton,
  StoryCard,
  StoryLayout,
  StoryLinkButton,
  getPriceQuality,
  useRateCta,
} from "@/components/story";
import { useStoryHome } from "@/components/home/useStoryHome";
import { FAQSection } from "@/components/contact/FAQSection";
import { ScoreScale } from "@/components/faq/ScoreScale";

const formatCount = (n: number | undefined) => {
  if (!n) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`;
};

/** Visible, not hidden behind a click — these are the facts the trust depends on. */
const TRUST_FACTS = [
  "Scores come from people who actually drank it — not a scraped review, not manufacturer copy.",
  "A product's score is the community average: every honest vote counts the same as every other.",
  "Price-to-quality is tracked separately, so a 9.2 at €4 is never confused with a 9.2 at €1.50.",
  "Anyone can rate. Nobody can buy a rating — not with money, not with a free case of samples.",
];

/** Practical, click-to-expand questions — the trust-building ones live in the page body instead. */
const supportItems = [
  {
    question: "How do I add my own rating?",
    answer:
      'Sign up, then hit "Rate" from anywhere on the site. It takes about ninety seconds: a score, how it behaved in coffee if that matters to you, and an optional note. No photo required.',
  },
  {
    question: "Can I suggest a brand or product that's missing?",
    answer:
      "Yes — when you add a rating you can create the brand and product on the spot if they're not already in the catalogue. Most of what's here started exactly that way.",
  },
  {
    question: "Can I edit or delete a rating I made?",
    answer:
      "Any time, from your profile. It's your verdict; you keep control of it, and the product's average updates the moment you change it.",
  },
  {
    question: "Is any of this free?",
    answer:
      "All of it. Browsing, rating, the leaderboard, everything. There is no paid tier, because there is nothing to sell you — see the pledge above.",
  },
];

/** Structured data mirrors what's actually visible on the page — the trust answers above the fold, the practical ones in the accordion. */
const faqSchemaItems = [
  {
    question: "How are Milk Me Not ratings calculated?",
    answer:
      "Every product's score is the average of every 0–10 rating the community has left for it, from people who drank the actual carton. The average then lands in one of five named tiers, from Waste to Gem.",
  },
  {
    question: "Who is allowed to rate a product?",
    answer: "Anyone with an account. Nobody can buy a rating, a badge, or a better spot on the leaderboard.",
  },
  {
    question: "Does price affect a product's score?",
    answer:
      "No — taste score and price-to-quality are tracked as two separate numbers, so a great-tasting but expensive carton is never confused with an equally great-tasting bargain.",
  },
  {
    question: "Has a brand ever paid Milk Me Not for a rating or placement?",
    answer: "No. If that ever changes, it will be disclosed on this page before it appears anywhere else on the site.",
  },
  ...supportItems,
];

const FAQ = () => {
  const cta = useRateCta();
  const { data } = useStoryHome();

  const overpriced = getPriceQuality("pricey");
  const bargain = getPriceQuality("great value");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchemaItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <StoryLayout mobileCtaHint="90 seconds. No brand can buy this list.">
      <Seo
        title="How ratings work — Milk Me Not"
        description="Zero to ten, five named tiers, and a scale nobody can pay to move. How Milk Me Not's community scores are calculated, why price is tracked separately, and what happens if a brand ever pays us."
        path="/faq"
        jsonLd={faqJsonLd}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero">
        <div className="max-w-3xl">
          <Kicker>How this works</Kicker>
          <Display as="h1" size="hero" className="mt-5">
            The score is
            <br />
            <span className="text-story-green">not a vibe.</span>
          </Display>
          <Lede className="mt-6 max-w-xl">
            Every number on this site came out of someone's actual mouth. Here is exactly how a carton gets from
            fridge to feed to leaderboard — and the four things that stop the scale being bought, gamed or averaged
            into meaninglessness.
          </Lede>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StoryButton onClick={cta.go} className="w-full sm:w-auto">
              {cta.label}
              <ArrowRight />
            </StoryButton>
            <StoryLinkButton to="/results" tone="outline" className="w-full sm:w-auto">
              See the scoreboard
            </StoryLinkButton>
          </div>
        </div>
      </Band>

      <div className="text-story-amber-light">
        <CrestDivider className="block h-12 w-full sm:h-20" />
      </div>

      {/* ── The scale ────────────────────────────────────────────────── */}
      <Band ground="amber" size="lg">
        <SectionHead
          kicker="The scale"
          title="Zero to ten, five words, no math"
          lede="Every rating lands on this line. Read the number, read the word underneath it — that's the entire system, in full view."
        />
        <ScoreScale />
        <p className="mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-story-ink/70">
          The tier is exact, not a rounding: 7.9 is Good, 8.0 is Gem. Nothing in between gets softened for a brand
          that's close.
        </p>
      </Band>

      {/* ── Where the number comes from ─────────────────────────────── */}
      <Band ground="paper" size="lg">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Kicker>Where the number comes from</Kicker>
            <Display size="xl" className="mt-5">
              One drink.
              <br />
              <span className="text-story-green">One honest number.</span>
            </Display>
            <Lede className="mt-5">
              There is no editorial team scoring products behind closed doors. There is no algorithm guessing at
              quality from ingredient lists. There is a form, a scale, and whoever actually opened the carton.
            </Lede>
            <DropList className="mt-7" items={TRUST_FACTS} />
          </div>

          <StoryCard className="story-lift relative overflow-hidden p-7 sm:p-8 lg:self-start">
            <span aria-hidden className="absolute -right-6 -top-6 text-story-green opacity-[0.08]">
              <MilkDrop size={150} variant="solid" />
            </span>
            <p className="story-kicker relative text-story-muted-2">Logged so far</p>
            <dl className="relative mt-6 grid grid-cols-3 gap-4 border-b border-story-ink/8 pb-7">
              {[
                { value: data?.totalRatings, label: "Ratings" },
                { value: data?.products, label: "Products" },
                { value: data?.brands, label: "Brands" },
              ].map((s) => (
                <div key={s.label}>
                  <dd className="story-num text-[clamp(1.5rem,4vw,2rem)] leading-none text-story-ink">
                    {formatCount(s.value)}
                  </dd>
                  <dt className="story-kicker mt-2 text-story-muted-2">{s.label}</dt>
                </div>
              ))}
            </dl>
            <p className="relative mt-6 text-[0.9375rem] leading-relaxed text-story-muted">
              Every one of them from a drinker, none of them from a brand. That's the whole trust model — there is no
              other kind of row in this database.
            </p>
          </StoryCard>
        </div>
      </Band>

      {/* ── Price vs. quality ────────────────────────────────────────── */}
      <Band ground="sky" size="lg">
        <SectionHead
          kicker="Score vs. price"
          title="A 9.2 is not always a 9.2"
          lede="Two cartons can earn the identical taste score and mean completely different things for your basket. That's why the site tracks them as two separate numbers, never one blended figure."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <StoryCard className="p-7 sm:p-8">
            <p className="text-sm font-medium text-story-muted">Barista-blend oat, name brand</p>
            <div className="mt-4 flex items-end justify-between">
              <ScoreMark score={9.2} size="lg" showTier={false} />
              {overpriced && (
                <span
                  className="rounded-full px-3.5 py-1.5 text-[0.8125rem] font-bold"
                  style={{ backgroundColor: overpriced.light, color: overpriced.ink }}
                >
                  €4.20 · {overpriced.label}
                </span>
              )}
            </div>
            <p className="mt-5 border-t border-story-ink/8 pt-5 text-[0.9375rem] leading-relaxed text-story-muted">
              Tastes like a 9.2. Costs like it knows it.
            </p>
          </StoryCard>

          <StoryCard className="p-7 sm:p-8">
            <p className="text-sm font-medium text-story-muted">Supermarket own-brand oat</p>
            <div className="mt-4 flex items-end justify-between">
              <ScoreMark score={9.2} size="lg" showTier={false} />
              {bargain && (
                <span
                  className="rounded-full px-3.5 py-1.5 text-[0.8125rem] font-bold"
                  style={{ backgroundColor: bargain.light, color: bargain.ink }}
                >
                  €1.49 · {bargain.label}
                </span>
              )}
            </div>
            <p className="mt-5 border-t border-story-ink/8 pt-5 text-[0.9375rem] leading-relaxed text-story-muted">
              Tastes exactly like a 9.2. Costs a third of the price.
            </p>
          </StoryCard>
        </div>
      </Band>

      {/* ── The pledge ───────────────────────────────────────────────── */}
      <Band ground="forest" size="lg">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-14 hidden text-story-green lg:block">
          <MilkDrop size={280} variant="solid" />
        </div>

        <div className="relative max-w-2xl">
          <Kicker tone="light">The pledge</Kicker>
          <Display size="xl" className="mt-5 text-white">
            If a brand ever pays us,
            <br />
            <span className="text-story-green-light">it says so right here first.</span>
          </Display>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/70">
            No sponsored placements. No affiliate links dressed up as reviews. No brand has ever bought a point, a
            badge, or a spot on the leaderboard — not a famous one, not a struggling one, not one run by someone's
            cousin. If that ever changes, this paragraph is where you'll read it, before it appears anywhere else on
            the site.
          </p>
          <Link
            to="/about"
            className="relative mt-7 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-light no-underline hover:underline"
          >
            Meet the people who started this
            <ArrowRight />
          </Link>
        </div>
      </Band>

      {/* ── Everything else ──────────────────────────────────────────── */}
      <Band ground="cream-2" size="lg">
        <SectionHead kicker="Still stuck?" title="Everything else, answered" />
        <div className="mt-10">
          <FAQSection title="Practical questions" items={supportItems} />
        </div>
        <p className="mt-6 text-[0.9375rem] text-story-muted">
          Didn't find it?{" "}
          <Link to="/contact" className="font-bold text-story-green-dark no-underline hover:underline">
            Write to an actual person
          </Link>
          .
        </p>
      </Band>
    </StoryLayout>
  );
};

export default FAQ;
