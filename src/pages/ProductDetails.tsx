import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { QuickRateSheet } from "@/components/story/QuickRateSheet";
import { humanizeLabels } from "@/lib/labels";
import {
  ArrowRight,
  Band,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  Pour,
  ScoreMark,
  SectionHead,
  StoryButton,
  StoryCard,
  StoryLayout,
  StoryLinkButton,
  useRateCta,
} from "@/components/story";
import { useProductStory, type ProductStory, type PriceQualityBin } from "@/components/product/useProductStory";
import { ScoreDistribution } from "@/components/product/ScoreDistribution";
import { RatingsFeed } from "@/components/product/RatingsFeed";

const BackLink = () => (
  <Link
    to="/results"
    className="inline-flex items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-story-muted-2 no-underline hover:text-story-ink"
  >
    <ArrowRight className="rotate-180" />
    All ratings
  </Link>
);

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const { story, isLoading, notFound } = useProductStory(productId);
  const cta = useRateCta();
  const [quickRateOpen, setQuickRateOpen] = useState(false);

  // Signed-in readers rate the carton they are already looking at without
  // leaving the page. Everyone else goes to sign-up, which is what the shared
  // CTA already does — previously this button sent even signed-in readers to a
  // blank /add, throwing away the product they had just chosen.
  const onRateClick = () => {
    if (cta.isAuthed && productId) setQuickRateOpen(true);
    else cta.go();
  };

  if (notFound) {
    return (
      <StoryLayout mobileCtaHint="90 seconds. No photo needed.">
        <Seo
          title="Carton not found — Milk Me Not"
          description="We couldn't find that plant-milk product on Milk Me Not."
          path={`/product/${productId ?? ""}`}
          noindex
        />
        <Band ground="forest" size="md" className="flex min-h-[56vh] flex-col items-center justify-center text-center">
          <div aria-hidden className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-story-green opacity-40">
            <MilkDrop size={260} variant="solid" />
          </div>
          <div className="relative">
            <Kicker tone="light" className="justify-center">Page not found</Kicker>
            <Display size="xl" className="mt-5 text-white">
              We don&apos;t have
              <br />
              that carton.
            </Display>
            <Lede tone="light" className="mx-auto mt-5 max-w-md">
              It may have been renamed, merged with another listing, or never rated at all. Try the board — or be the
              one who adds it.
            </Lede>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <StoryButton onClick={cta.go} tone="paper">
                {cta.label}
                <ArrowRight />
              </StoryButton>
              <StoryLinkButton to="/results" tone="outline-light">
                See every product
              </StoryLinkButton>
            </div>
          </div>
        </Band>
      </StoryLayout>
    );
  }

  if (isLoading || !story) {
    return (
      <StoryLayout mobileCtaHint="90 seconds. No photo needed.">
        <Seo
          title="Loading — Milk Me Not"
          description="Community reviews and ratings of plant-based milk products."
          path={`/product/${productId ?? ""}`}
          noindex
        />
        <Band ground="cream" size="hero" className="pt-6 sm:pt-10">
          <div className="animate-pulse">
            <div className="h-3 w-40 rounded-full bg-story-ink/10" />
            <div className="mt-6 h-14 w-4/5 max-w-xl rounded-2xl bg-story-ink/10 sm:h-16" />
            <div className="mt-4 h-14 w-3/5 max-w-lg rounded-2xl bg-story-ink/10 sm:h-16" />
            <div className="mt-8 flex gap-2">
              <div className="h-7 w-24 rounded-full bg-story-ink/10" />
              <div className="h-7 w-20 rounded-full bg-story-ink/10" />
            </div>
            <div className="mt-8 h-40 max-w-md rounded-[1.25rem] bg-story-ink/[0.07]" />
          </div>
        </Band>
      </StoryLayout>
    );
  }

  const productTitle = `${story.brandName} ${story.productName} — Reviews | Milk Me Not`;
  const productDescription = story.count
    ? `See ${story.count} community rating${story.count === 1 ? "" : "s"} of ${story.brandName} ${story.productName} on Milk Me Not — average score ${
        story.avgScore?.toFixed(1) ?? "—"
      }/10, rated ${story.tier.name}.`
    : `Be the first to rate ${story.brandName} ${story.productName} on Milk Me Not.`;
  const productJsonLd =
    story.count && story.avgScore
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${story.brandName} ${story.productName}`,
          brand: { "@type": "Brand", name: story.brandName },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: story.avgScore.toFixed(2),
            reviewCount: story.count,
            bestRating: "10",
            worstRating: "1",
          },
        }
      : undefined;

  // No Barista chip: the kicker two lines up already says "Barista blend", and
  // this page was stating it twice from two places that did not know about each
  // other — a chip reading BARISTA directly under a line reading BARISTA BLEND.
  // Prose can afford the longer term; the chips elsewhere cannot, which is why
  // badges say "Barista" and this says "Barista blend".
  const chips = [...humanizeLabels(story.properties), ...humanizeLabels(story.flavors)];

  return (
    <StoryLayout mobileCtaHint="90 seconds. No photo needed.">
      <Seo
        title={productTitle}
        description={productDescription}
        path={`/product/${productId ?? ""}`}
        type="product"
        jsonLd={productJsonLd}
      />

      {/* ── Hero: the verdict ────────────────────────────────────────── */}
      <Band ground="cream" size="hero" className="pt-6 sm:pt-10">
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 hidden text-story-green-dark opacity-[0.06] lg:block">
          <Pour size={260} />
        </div>

        <BackLink />

        <div className="relative mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14">
          <div>
            <Kicker>
              {story.brandName}
              {story.isBarista ? " · Barista blend" : ""}
            </Kicker>

            <Display as="h1" size="hero" className="mt-5 text-story-ink">
              {story.productName}
            </Display>

            {chips.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border-[1.5px] border-story-ink/12 px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-story-ink-2"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <Lede className="mt-6 max-w-lg">
              {story.count > 0
                ? `${story.count} ${story.count === 1 ? "person has" : "people have"} rated this. Here's the verdict.`
                : "Nobody has rated this one yet. Yours would be the first."}
            </Lede>

            {/* Phones get the score directly under the pitch, full width —
                this page's entire job is selling this one number. */}
            <VerdictCard story={story} className="mt-8 lg:hidden" />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StoryButton onClick={onRateClick} className="w-full sm:w-auto">
                Rate this one yourself
                <ArrowRight />
              </StoryButton>
              <StoryLinkButton to="/results" tone="outline" className="w-full sm:w-auto">
                See more ratings
              </StoryLinkButton>
            </div>
          </div>

          <div className="relative hidden lg:block lg:min-h-96">
            <div aria-hidden className="absolute -right-8 top-0 h-96 w-[24rem] rounded-full" style={{ backgroundColor: story.tier.light }} />
            <div aria-hidden className="pointer-events-none absolute right-4 top-13" style={{ color: story.tier.color }}>
              <MilkDrop size={190} variant="solid" />
            </div>
            <div className="absolute bottom-0 left-0 w-88">
              <VerdictCard story={story} />
            </div>
          </div>
        </div>
      </Band>

      {/* ── The spread ───────────────────────────────────────────────── */}
      <Band ground="paper" size="lg">
        <SectionHead
          kicker="Not just an average"
          title="Where the votes actually landed"
          lede={
            story.count > 0
              ? "Every rating that built the number above, grouped into the same five tiers the whole site uses."
              : "Once this one has ratings, the spread will show up here — tier by tier."
          }
        />

        {story.count > 0 ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10">
            <StoryCard className="p-6 sm:p-8">
              <ScoreDistribution bins={story.histogram} max={story.histogramMax} />
            </StoryCard>

            <PriceQualityPanel bins={story.priceQuality} top={story.topPriceQuality} />
          </div>
        ) : (
          <StoryCard className="mt-10 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-[0.9375rem] text-story-muted">
              No scores yet for {story.brandName} {story.productName}.
            </p>
            <StoryButton onClick={cta.go} size="md" className="shrink-0">
              Be the first to rate it
              <ArrowRight />
            </StoryButton>
          </StoryCard>
        )}
      </Band>

      {/* ── The receipts ─────────────────────────────────────────────── */}
      <Band ground="cream" size="lg">
        <SectionHead
          kicker="The receipts"
          title="Every rating, unfiltered"
          lede="Real scores from real tests. Names and notes are for members — everything else is open to anyone."
        />

        <StoryCard className="mt-10 p-5 sm:p-8">
          <RatingsFeed ratings={story.ratings} isAuthed={story.isAuthed} onSignIn={cta.go} />
        </StoryCard>
      </Band>

      {productId && (
        <QuickRateSheet
          open={quickRateOpen}
          onOpenChange={setQuickRateOpen}
          productId={productId}
          productName={story.productName}
          brandName={story.brandName}
        />
      )}
    </StoryLayout>
  );
};

/** The page's single biggest object: this product's score, at display scale. */
const VerdictCard = ({ story, className }: { story: ProductStory; className?: string }) => (
  <StoryCard className={`story-lift relative overflow-hidden p-7 sm:p-8 ${className ?? ""}`}>
    <span aria-hidden className="absolute -right-8 -top-8 opacity-[0.10]" style={{ color: story.tier.color }}>
      <MilkDrop size={200} />
    </span>

    <p className="story-kicker text-story-muted-2">The community verdict</p>

    <div className="relative mt-5">
      <ScoreMark score={story.avgScore} size="xl" />
    </div>

    <p className="relative mt-3 max-w-xs text-[0.9375rem] leading-snug text-story-muted">{story.tier.blurb}</p>

    <div className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-story-ink/8 pt-5">
      <span className="text-[0.8125rem] font-bold text-story-ink">
        {story.count > 0 ? `${story.count} ${story.count === 1 ? "rating" : "ratings"}` : "No ratings yet"}
      </span>
      {story.topPriceQuality && (
        <span
          className="rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
          style={{ backgroundColor: story.topPriceQuality.light, color: story.topPriceQuality.color }}
        >
          {story.topPriceQuality.label}
        </span>
      )}
    </div>
  </StoryCard>
);

/** Price-to-quality, tracked separately from taste — a fair-priced Gem reads
    differently from an overpriced one, even at the same score. */
const PriceQualityPanel = ({ bins, top }: { bins: PriceQualityBin[]; top: PriceQualityBin | null }) => (
  <StoryCard className="flex flex-col p-6 sm:p-8">
    <p className="story-kicker text-story-muted-2">Price vs. quality</p>
    {top ? (
      <>
        <p className="story-serif mt-4 text-[1.5rem] font-bold" style={{ color: top.color }}>
          {top.label}
        </p>
        <p className="mt-1 text-[0.875rem] text-story-muted">
          The most common call from people who priced this one.
        </p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {bins.map((b) => (
            <li key={b.key} className="flex items-center justify-between gap-3 text-[0.875rem]">
              <span className="font-medium" style={{ color: b.color }}>
                {b.label}
              </span>
              <span className="story-num text-story-muted-2">{b.count}</span>
            </li>
          ))}
        </ul>
      </>
    ) : (
      <p className="mt-4 text-[0.9375rem] text-story-muted">Nobody has rated the price on this one yet.</p>
    )}
  </StoryCard>
);

export default ProductDetails;
