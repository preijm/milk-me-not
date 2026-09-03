import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Seo } from "@/components/Seo";
import {
  ArrowRight,
  Band,
  BrandMark,
  Display,
  Kicker,
  Lede,
  ScoreMark,
  StoryLayout,
} from "@/components/story";
import { findBrandName, productsForBrand } from "@/components/brand/brandSummary";
import { RATING_FACTS_KEY, fetchRatingFacts } from "@/hooks/useRatingFacts";
import { brandFacts, brandState } from "@/lib/brandFacts";
import { brandSlug } from "@/lib/brandLogo";

const OWNER_KIND_LABEL = {
  "own-label": "Supermarket own-label",
  group: "Part of a larger group",
  independent: "Independent company",
} as const;

/** "2024-10" → "October 2024". Left as given when it is only a year. */
const readableSince = (since: string) => {
  const [year, month] = since.split("-");
  if (!month) return year;
  const name = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleString("en", {
    month: "long",
    timeZone: "UTC",
  });
  return `${name} ${year}`;
};

/** "2026-08-30" → "30 August 2026". A reader should not have to parse ISO. */
const readableDay = (iso: string) => {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const readableMarkets = (codes: string[]) => {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return codes.map((c) => {
    try {
      return names.of(c) ?? c;
    } catch {
      return c;
    }
  });
};

/**
 * One maker, everything the board has from them, and whether you can still buy
 * any of it.
 *
 * The status panel is the only thing here that is not derived from ratings, and
 * it is deliberately the loudest element on the page when it says a brand has
 * stopped — that is the fact a reader came for and cannot get anywhere else.
 */
const BrandDetail = () => {
  const { brandSlug: slug = "" } = useParams();
  const { data: facts = [], isLoading } = useQuery({
    queryKey: RATING_FACTS_KEY,
    queryFn: fetchRatingFacts,
  });

  const brand = useMemo(() => findBrandName(facts, slug, brandSlug), [facts, slug]);
  const products = useMemo(() => (brand ? productsForBrand(facts, brand) : []), [facts, brand]);

  const ratings = products.reduce((sum, p) => sum + p.n, 0);
  const average = ratings ? products.reduce((sum, p) => sum + p.avg * p.n, 0) / ratings : null;
  const info = brand ? brandFacts(brand) : null;
  const state = brand ? brandState(brand) : "unchecked";
  const status = info?.status;

  if (isLoading) {
    return (
      <StoryLayout>
        <Band ground="cream" size="lg">
          <div className="story-hairline h-96 animate-pulse rounded-3xl bg-white" aria-hidden />
        </Band>
      </StoryLayout>
    );
  }

  if (!brand) {
    return (
      <StoryLayout>
        <Seo
          title="Brand not found — Milk Me Not"
          description="No brand on the board matches this address."
          path={`/brand/${slug}`}
          noindex
        />
        <Band ground="cream" size="lg">
          <Kicker>Nothing here</Kicker>
          <Display as="h1" size="lg" className="mt-4">
            No brand by that name
          </Display>
          <Lede className="mt-4 max-w-136">
            Nobody has rated anything from this maker, or the address is wrong.
          </Lede>
          <Link
            to="/brands"
            className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-dark no-underline hover:underline"
          >
            See every brand
            <ArrowRight />
          </Link>
        </Band>
      </StoryLayout>
    );
  }

  const owner = info?.owner;
  const gone = state === "discontinued";

  return (
    <StoryLayout>
      <Seo
        title={`${brand} — every rating | Milk Me Not`}
        description={
          gone
            ? `${brand} has been discontinued. ${ratings} community rating${ratings === 1 ? "" : "s"} of their plant milks are still on Milk Me Not.`
            : `${ratings} community rating${ratings === 1 ? "" : "s"} of ${brand} plant milks, averaging ${average?.toFixed(1)} on Milk Me Not.`
        }
        path={`/brand/${slug}`}
      />

      <Band ground="cream" size="lg">
        <Link
          to="/brands"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-story-muted no-underline hover:text-story-ink"
        >
          ← All brands
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BrandMark brand={brand} className="h-16 w-16 text-[1rem]" radius="rounded-2xl" />
          <div className="min-w-0">
            {owner && (
              <Kicker>
                {owner.kind === "own-label" && owner.chain
                  ? `${owner.chain} own-label`
                  : owner.name}
              </Kicker>
            )}
            <Display as="h1" size="lg" className={owner ? "mt-2" : undefined}>
              {brand}
            </Display>
          </div>
        </div>

        {/* The one fact that is not a number. Loud when it says a brand has
            gone, because that is what changes what a reader does next. */}
        {gone && status && (
          <div className="mt-8 max-w-2xl rounded-[1.25rem] bg-story-amber-light px-5 py-4">
            <p className="text-[0.9375rem] font-bold text-story-amber-dark">
              Discontinued — you cannot buy this any more
            </p>
            <p className="mt-1 text-[0.8125rem] font-medium leading-relaxed text-story-amber-dark/90">
              {status.markets?.length
                ? `Withdrawn from ${readableMarkets(status.markets).join(" and ")}`
                : "Withdrawn"}
              {status.since ? ` by ${readableSince(status.since)}` : ""}. Checked {readableDay(status.checked)}.
              {status.source && (
                <>
                  {" "}
                  <a
                    href={status.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline"
                  >
                    Source
                  </a>
                </>
              )}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ScoreMark score={average} size="lg" />
          <div className="text-[0.9375rem] font-medium text-story-muted">
            {ratings} rating{ratings === 1 ? "" : "s"} across {products.length} product
            {products.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Said in a sentence rather than a chip.
            This was a "Not checked" pill, which describes our own filing
            rather than the drink — a reader looking at it has no idea whether
            that is a warning, a verdict or a fault. There is room here for the
            actual answer, and the actual answer to "can I still buy this" has
            three forms, one of which is that nobody knows. */}
        {!gone && (
          <p className="mt-5 max-w-2xl text-[0.9375rem] font-medium text-story-muted">
            {state === "listed" ? (
              <>
                Still on sale, as far as we know
                {status?.checked ? <> — checked {readableDay(status.checked)}</> : null}.
              </>
            ) : (
              <>We do not know whether this is still on sale. Nobody has checked.</>
            )}
          </p>
        )}

        {owner && (
          <p className="mt-6 max-w-2xl text-[0.875rem] font-medium text-story-muted">
            {OWNER_KIND_LABEL[owner.kind]}
            {owner.kind === "own-label" && owner.chain ? (
              <> — sold at {owner.chain}, and nowhere else.</>
            ) : (
              <> — {owner.name}.</>
            )}
          </p>
        )}

        {/* The half a state cannot hold: pulled from one country, or bought
            out of its owner's administration. Without this the page would
            round both of those to "still listed" and say nothing. */}
        {info?.note && (
          <p className="mt-3 max-w-2xl border-l-2 border-story-ink/12 pl-4 text-[0.875rem] font-medium leading-relaxed text-story-muted">
            {info.note}
            {status?.source && (
              <>
                {" "}
                <a
                  href={status.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-story-green-dark underline-offset-2 hover:underline"
                >
                  Source
                </a>
              </>
            )}
          </p>
        )}
      </Band>

      <Band ground="paper" size="lg">
        <Kicker>What the board has</Kicker>
        <Display as="h2" size="md" className="mt-4">
          {products.length === 1 ? "One product, rated" : `${products.length} products, rated`}
        </Display>

        <ul className="story-hairline mt-8 flex flex-col rounded-[1.25rem] bg-white px-4 sm:px-6">
          {products.map((p) => {
            const row = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="story-product-name block truncate text-[0.9375rem] font-bold text-story-ink">
                    {p.product}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] font-medium text-story-muted-2">
                    {p.n} rating{p.n === 1 ? "" : "s"}
                    {p.isBarista ? " · Barista" : ""}
                  </span>
                </span>
                <ScoreMark score={p.avg} size="sm" showTier={false} className="shrink-0" />
              </>
            );
            return (
              <li key={p.productId ?? p.product} className="border-t border-story-ink/8 first:border-t-0">
                {p.productId ? (
                  <Link
                    to={`/product/${p.productId}`}
                    className="story-linked-product flex items-center gap-4 py-4 no-underline"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 py-4">{row}</div>
                )}
              </li>
            );
          })}
        </ul>

        {gone && (
          <p className="mt-6 max-w-2xl text-[0.875rem] font-medium text-story-muted">
            These ratings stay. Somebody drank it and said what they thought, and that is still true — it just is not
            shopping advice any more.
          </p>
        )}
      </Band>
    </StoryLayout>
  );
};

export default BrandDetail;
