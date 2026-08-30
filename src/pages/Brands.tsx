import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Seo } from "@/components/Seo";
import { Band, BrandMark, Display, Kicker, Lede, StoryLayout } from "@/components/story";
import { BrandStatusChip } from "@/components/brand/BrandStatusChip";
import { brandSummaries } from "@/components/brand/brandSummary";
import { RATING_FACTS_KEY, fetchRatingFacts } from "@/hooks/useRatingFacts";
import { brandFacts, brandState } from "@/lib/brandFacts";
import { brandSlug } from "@/lib/brandLogo";

/**
 * Every maker on the board, and what we know about them.
 *
 * Ordered by ratings rather than by score. A brand with one enthusiastic
 * rating is not the best brand here, and putting it top would say it was — the
 * ranking by score already exists on Results and does that job honestly, with
 * a minimum sample.
 */
const Brands = () => {
  const { data: facts = [], isLoading } = useQuery({
    queryKey: RATING_FACTS_KEY,
    queryFn: fetchRatingFacts,
  });

  const rows = useMemo(() => brandSummaries(facts), [facts]);
  const gone = rows.filter((r) => brandState(r.brand) === "discontinued");
  const goneRatings = gone.reduce((sum, r) => sum + r.n, 0);

  return (
    <StoryLayout>
      <Seo
        title="Every brand on the board — Milk Me Not"
        description="All the makers behind the plant milks people have rated: who owns them, how many ratings each has, and which ones you can no longer buy."
        path="/brands"
      />

      <Band ground="cream" size="lg">
        {/* Kicker and Display rather than SectionHead, which renders an h2 —
            and this is the top of its own page, so it wants the h1. */}
        <Kicker>Who makes it</Kicker>
        <Display as="h1" size="lg" className="mt-4 max-w-2xl">
          {rows.length ? `${rows.length} brands have been drunk and argued about` : "Every brand on the board"}
        </Display>
        <Lede className="mt-4 max-w-2xl">
          Ordered by how much the board has to say about each one. Some are supermarket own-labels you can only buy in
          one chain, some belong to companies you would recognise, and{" "}
          {gone.length > 0 ? (
            <>
              {gone.length === 1 ? "one" : gone.length} of them {gone.length === 1 ? "has" : "have"} stopped selling
              altogether — {goneRatings} rating{goneRatings === 1 ? "" : "s"} for drinks you can no longer buy.
            </>
          ) : (
            <>a few have stopped selling altogether.</>
          )}
        </Lede>

        {isLoading ? (
          <div className="story-hairline mt-10 h-96 animate-pulse rounded-3xl bg-white" aria-hidden />
        ) : (
          <ul className="story-hairline mt-10 flex flex-col rounded-[1.25rem] bg-white px-4 sm:px-6">
            {rows.map((row) => {
              const owner = brandFacts(row.brand)?.owner;
              const state = brandState(row.brand);
              return (
                <li key={row.brand} className="border-t border-story-ink/8 first:border-t-0">
                  <Link
                    to={`/brand/${brandSlug(row.brand)}`}
                    className="story-linked-product flex items-center gap-3 py-4 no-underline sm:gap-4"
                  >
                    <BrandMark brand={row.brand} className="h-10 w-10 text-[0.6875rem]" radius="rounded-xl" />

                    <span className="min-w-0 flex-1">
                      <span className="story-product-name block truncate text-[0.9375rem] font-bold text-story-ink">
                        {row.brand}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.75rem] font-medium text-story-muted-2">
                        {owner ? (
                          <>
                            {owner.kind === "own-label" && owner.chain
                              ? `${owner.chain} own-label`
                              : owner.kind === "independent"
                                ? "Independent"
                                : owner.name}
                            {" · "}
                          </>
                        ) : null}
                        {row.n} rating{row.n === 1 ? "" : "s"} · {row.products} product
                        {row.products === 1 ? "" : "s"}
                      </span>
                    </span>

                    {/* "Discontinued" is the one thing this page exists to
                        say, so it survives the phone. "Still listed" is the
                        quiet case and can wait for the room to show it. */}
                    {state === "discontinued" ? (
                      <BrandStatusChip state={state} />
                    ) : state === "listed" ? (
                      <BrandStatusChip state={state} className="hidden sm:inline-flex" />
                    ) : null}

                    <span
                      className="story-num shrink-0 text-[1.125rem] leading-none text-story-green-dark"
                      aria-label={`Average ${row.avg.toFixed(1)}`}
                    >
                      {row.avg.toFixed(1)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 max-w-2xl text-[0.8125rem] font-medium text-story-muted-2">
          A brand with no badge is one nobody has checked, not one we know is fine. Averages here include every rating,
          however few — see{" "}
          <Link to="/results" className="font-bold text-story-green-dark">
            Discover
          </Link>{" "}
          for the ranking that requires a real sample.
        </p>
      </Band>
    </StoryLayout>
  );
};

export default Brands;
