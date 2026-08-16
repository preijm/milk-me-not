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
  Pour,
  SCORE_TIERS,
  ScoreMark,
  SectionHead,
  Sprig,
  StoryButton,
  StoryCard,
  StoryLayout,
  StoryLinkButton,
  TypeMark,
  getTier,
  MILK_BASES,
  useRateCta,
} from "@/components/story";
import { useStoryHome } from "@/components/home/useStoryHome";

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : `${n}`);

const BASE_TONE = [
  { bg: "bg-story-green-wash", fg: "text-story-green-dark" },
  { bg: "bg-story-blue-light", fg: "text-story-blue-dark" },
  { bg: "bg-story-amber-light", fg: "text-story-amber-dark" },
];

const STEPS = [
  {
    n: "01",
    title: "Drink something new",
    body: "A carton you have never tried, a barista blend the café swears by, the supermarket own-brand nobody talks about.",
  },
  {
    n: "02",
    title: "Score it out of ten",
    body: "Ninety seconds. How it tastes, how it behaves in coffee, whether the price was fair. Notes optional, honesty mandatory.",
  },
  {
    n: "03",
    title: "Watch the shelf reorder itself",
    body: "Your score joins everyone else's. The leaderboard shifts. The next person in that aisle stops guessing.",
  },
];

const PILLARS = [
  {
    title: "Every base, not one brand",
    body: "Oat, almond, soy, coconut, rice, hazelnut, pea, cashew. Supermarket own-brands sit next to the famous cartons and get judged on exactly the same scale.",
  },
  {
    title: "A verdict, not a star average",
    body: "Scores land in a named tier — Waste through Gem — so you know at a glance whether a carton is worth the shelf space or the sink.",
  },
  {
    title: "Nobody pays us",
    body: "No sponsored placements, no affiliate deals, no brand ever bought a point. If that ever changes, it will say so right here.",
  },
];

const Home = () => {
  const cta = useRateCta();
  const { data, isLoading } = useStoryHome();

  const stats = [
    { value: data ? formatCount(data.totalRatings) : "—", label: "Honest ratings" },
    { value: data ? formatCount(data.products) : "—", label: "Products scored" },
    { value: data ? formatCount(data.brands) : "—", label: "Brands covered" },
  ];

  const leaderboard = data?.leaderboard ?? [];

  return (
    <StoryLayout transparentHeader mobileCtaHint="90 seconds. No photo needed.">
      <Seo
        title="Milk Me Not — the community that rates every plant milk"
        description="Ditch the Moo. Find your new. Real scores from people who actually drank it — oat, almond, soy, coconut and more, ranked by taste, coffee performance and price."
        path="/"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Band ground="cream" size="hero" className="pt-6 sm:pt-10">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 text-story-green opacity-90 sm:-right-16">
          <MilkDrop size={420} className="hidden lg:block" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-10 text-story-green sm:hidden">
          <MilkDrop size={210} />
        </div>
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 hidden text-story-green-dark opacity-[0.06] lg:block">
          <Sprig size={260} />
        </div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Kicker>Independent · community scored · never sponsored</Kicker>

            <Display as="h1" size="hero" className="mt-5 max-w-[13ch] text-story-ink">
              Ditch the Moo.
              <br />
              <span className="text-story-green">Find your new.</span>
            </Display>

            <Lede className="mt-6 max-w-[34rem]">
              {data?.products ? `${data.products} plant milks` : "Hundreds of plant milks"} have been drunk, scored and
              argued about by people obsessed with taste. No brand has ever paid for a point.
            </Lede>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StoryButton onClick={cta.go} className="w-full sm:w-auto">
                {cta.label}
                <ArrowRight />
              </StoryButton>
              <StoryLinkButton to="/results" tone="outline" className="w-full sm:w-auto">
                See the leaderboard
              </StoryLinkButton>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-story-ink/[0.08] pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dd className="story-num text-[clamp(1.9rem,7vw,2.75rem)] leading-none text-story-ink">{s.value}</dd>
                  <dt className="story-kicker mt-2 text-story-muted-2">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Desktop: the current top-scoring carton, as the product shot we do not have. */}
          <div className="relative hidden lg:block">
            <TopVerdictCard entry={leaderboard[0]} loading={isLoading} />
          </div>
        </div>
      </Band>

      <div className="text-story-paper">
        <CrestDivider className="block h-12 w-full sm:h-20" />
      </div>

      {/* ── Leaderboard ──────────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <SectionHead
          kicker="The board right now"
          title={
            <>
              What the community
              <br className="hidden sm:block" /> would actually buy again
            </>
          }
          lede={
            data?.ratingsThisWeek
              ? `${data.ratingsThisWeek} new rating${data.ratingsThisWeek === 1 ? "" : "s"} landed in the last seven days.`
              : "Ranked by score, with at least two people in agreement."
          }
          trailing={
            <Link
              to="/results"
              className="inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark no-underline hover:underline"
            >
              All {data?.products ?? ""} products
              <ArrowRight />
            </Link>
          }
        />

        <ol className="mt-10 flex flex-col">
          {(isLoading ? Array.from({ length: 5 }) : leaderboard.slice(0, 5)).map((raw, i) => {
            const entry = raw as (typeof leaderboard)[number] | undefined;
            const tier = getTier(entry?.score);
            return (
              <li key={entry?.productId ?? i} className="border-t border-story-ink/[0.08] last:border-b">
                <Link
                  to={entry ? `/product/${entry.productId}` : "/results"}
                  className="group flex items-center gap-4 py-5 no-underline sm:gap-6 sm:py-6"
                >
                  <span className="story-num w-7 flex-shrink-0 text-[1.5rem] leading-none text-story-muted-2 sm:w-10 sm:text-[2rem]">
                    {i + 1}
                  </span>

                  <span
                    className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl sm:flex"
                    style={{ backgroundColor: tier.light, color: tier.color }}
                  >
                    <TypeMark base={entry?.base ?? "blend"} size={38} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-[0.9375rem] sm:text-base">
                      <span className="font-medium text-story-muted">{entry?.brand ?? "Loading"}</span>
                      <span className="mx-1.5 text-story-muted-2">·</span>
                      <span className="font-bold text-story-ink group-hover:underline">{entry?.product ?? "…"}</span>
                    </span>
                    <span className="mt-1 block text-[0.8125rem] font-medium text-story-muted-2">
                      {entry ? `${entry.ratings} rating${entry.ratings === 1 ? "" : "s"} · ${tier.blurb}` : "—"}
                    </span>
                  </span>

                  <ScoreMark score={entry?.score} size="md" className="flex-shrink-0 flex-col items-end gap-0 sm:flex-row sm:items-baseline sm:gap-2.5" />
                  <ArrowRight className="hidden flex-shrink-0 text-story-muted-2 sm:block" />
                </Link>
              </li>
            );
          })}
        </ol>
      </Band>

      {/* ── Browse by base ───────────────────────────────────────────── */}
      <Band ground="cream-2" size="lg">
        <SectionHead
          kicker="Start somewhere"
          title="Pick a plant"
          lede="Every base gets the same scale, so a supermarket oat can — and regularly does — out-score a famous almond."
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {MILK_BASES.map((base, i) => {
            const tone = BASE_TONE[i % BASE_TONE.length];
            const count = data?.baseCounts?.[base.key];
            return (
              <li key={base.key}>
                <Link
                  to={`/results?search=${encodeURIComponent(base.search)}`}
                  className={`group flex h-full flex-col justify-between gap-6 rounded-[1.25rem] p-4 no-underline transition-transform duration-150 hover:-translate-y-0.5 sm:p-5 ${tone.bg}`}
                >
                  <span className={tone.fg}>
                    <TypeMark base={base.key} size={44} />
                  </span>
                  <span>
                    <span className={`block font-display text-[1.15rem] font-bold tracking-[-0.02em] sm:text-[1.35rem] ${tone.fg}`}>
                      {base.label}
                    </span>
                    <span className={`mt-0.5 block text-[0.75rem] font-semibold opacity-70 ${tone.fg}`}>
                      {count ? `${count} scored` : "Explore"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Band>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <Band ground="forest" size="lg">
        <div aria-hidden className="pointer-events-none absolute -right-20 top-8 text-story-green opacity-25">
          <Pour size={340} />
        </div>

        <div className="relative max-w-2xl">
          <Kicker tone="light">How this works</Kicker>
          <Display size="xl" className="mt-5 text-white">
            One carton. One score.
            <br />
            <span className="text-story-green-light">A shelf that finally makes sense.</span>
          </Display>
        </div>

        <ol className="relative mt-12 grid gap-8 sm:mt-16 lg:grid-cols-3 lg:gap-10">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-white/15 pt-6">
              <span className="story-num block text-[2.5rem] leading-none text-story-green-light">{step.n}</span>
              <h3 className="story-serif mt-4 text-[1.35rem] font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="relative mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <StoryButton onClick={cta.go} tone="paper" className="w-full sm:w-auto">
            {cta.label}
            <ArrowRight />
          </StoryButton>
          <p className="text-sm font-medium text-white/55">Free forever. No brand deals. No spam.</p>
        </div>
      </Band>

      {/* ── The scale ────────────────────────────────────────────────── */}
      <Band ground="amber" size="lg">
        <SectionHead
          kicker="The scale"
          title="Five words that save you four euros"
          lede="Every score lands in a named tier. You never have to work out whether 6.4 is good."
        />

        <ol className="mt-10 grid gap-3 sm:grid-cols-5">
          {SCORE_TIERS.map((tier) => (
            <StoryCard as="li" key={tier.key} className="flex flex-col gap-2 p-5">
              <span className="story-num text-[1.05rem]" style={{ color: tier.color }}>
                {tier.min.toFixed(0)}–{tier.key === "gem" ? "10" : tier.max.toFixed(0)}
              </span>
              <span className="story-serif text-[1.35rem] font-bold" style={{ color: tier.color }}>
                {tier.name}
              </span>
              <span className="text-[0.875rem] leading-snug text-story-muted">{tier.blurb}</span>
              <span aria-hidden className="mt-2 h-1.5 w-full rounded-full" style={{ backgroundColor: tier.color }} />
            </StoryCard>
          ))}
        </ol>
      </Band>

      {/* ── Why trust it ─────────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <Kicker>Why trust the number</Kicker>
            <Display size="xl" className="mt-5">
              It started with
              <br />
              <span className="text-story-green">soy sauce.</span>
            </Display>
            <Lede className="mt-5">
              A colleague asked whether soy milk meant mixing soy sauce into milk. Someone tried it. What followed was a
              spreadsheet, then an obsession, then this.
            </Lede>
            <DropList
              className="mt-7"
              items={[
                "Scores come from people who actually drank the carton.",
                "Price-to-quality is tracked separately — a 9.2 at €4 is not a 9.2 at €1.50.",
                "Anyone can rate. Nobody can buy a rating.",
              ]}
            />
            <StoryLinkButton to="/about" tone="outline" size="md" className="mt-8">
              Read the whole story
              <ArrowRight />
            </StoryLinkButton>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {PILLARS.map((p) => (
              <StoryCard as="li" key={p.title} className="p-6 sm:p-7">
                <h3 className="story-serif text-[1.35rem] font-bold text-story-ink">{p.title}</h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-story-muted">{p.body}</p>
              </StoryCard>
            ))}
          </ul>
        </div>
      </Band>
    </StoryLayout>
  );
};

/** The hero's stand-in for a product photograph: the current highest verdict. */
const TopVerdictCard = ({
  entry,
  loading,
}: {
  entry?: { productId: string; brand: string; product: string; score: number; ratings: number; base: string };
  loading: boolean;
}) => {
  const tier = getTier(entry?.score);

  return (
    <StoryCard className="story-lift relative overflow-hidden p-8">
      <span aria-hidden className="absolute -right-8 -top-8 opacity-[0.10]" style={{ color: tier.color }}>
        <MilkDrop size={220} />
      </span>
      <p className="story-kicker text-story-muted-2">Top of the board</p>

      <div className="relative mt-6 flex items-start gap-5">
        <span
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl"
          style={{ backgroundColor: tier.light, color: tier.color }}
        >
          <TypeMark base={entry?.base ?? "blend"} size={54} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-story-muted">{loading ? "Loading" : entry?.brand}</p>
          <p className="story-serif mt-0.5 text-[1.6rem] font-bold leading-tight text-story-ink">
            {loading ? "…" : entry?.product}
          </p>
        </div>
      </div>

      <div className="relative mt-7 flex items-end justify-between border-t border-story-ink/[0.08] pt-6">
        <ScoreMark score={entry?.score} size="lg" showTier={false} />
        <div className="text-right">
          <p className="story-serif text-[1.25rem] font-bold italic" style={{ color: tier.color }}>
            {tier.name}
          </p>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-story-muted-2">
            {entry ? `${entry.ratings} people agree` : "—"}
          </p>
        </div>
      </div>

      <Link
        to={entry ? `/product/${entry.productId}` : "/results"}
        className="relative mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark no-underline hover:underline"
      >
        See every rating
        <ArrowRight />
      </Link>
    </StoryCard>
  );
};

export default Home;
