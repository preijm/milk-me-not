import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Seo } from "@/components/Seo";
import { Band, Display, Kicker, Lede, StoryLayout } from "@/components/story";
import { BrandSortHeader, BrandTable } from "@/components/brand/BrandTable";
import { brandSummaries } from "@/components/brand/brandSummary";
import {
  NO_FILTER,
  filterBrands,
  firstDirectionFor,
  isFiltered,
  sortBrands,
  type BrandFilter,
  type BrandSort,
  type BrandSortKey,
} from "@/components/brand/brandTableState";
import { RATING_FACTS_KEY, fetchRatingFacts } from "@/hooks/useRatingFacts";
import { brandState, type BrandOwnerKind } from "@/lib/brandFacts";
import { cn } from "@/lib/utils";

const KIND_FILTERS: { value: BrandOwnerKind | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "own-label", label: "Own-label" },
  { value: "group", label: "Group" },
  { value: "independent", label: "Independent" },
];

const PILL =
  "flex h-10 shrink-0 items-center rounded-full border-[1.5px] px-3.5 text-[0.8125rem] font-bold transition-colors";

/**
 * Every maker on the board, and what we know about them.
 *
 * Sorted by ratings out of the box rather than by score. A brand with one
 * enthusiastic rating is not the best brand here, and leading with it would say
 * it was — Results already ranks by score, honestly, with a minimum sample.
 */
const Brands = () => {
  const { data: facts = [], isLoading } = useQuery({
    queryKey: RATING_FACTS_KEY,
    queryFn: fetchRatingFacts,
  });

  const [sort, setSort] = useState<BrandSort>({ key: "ratings", direction: "desc" });
  const [filter, setFilter] = useState<BrandFilter>(NO_FILTER);

  const all = useMemo(() => brandSummaries(facts), [facts]);
  const rows = useMemo(() => sortBrands(filterBrands(all, filter), sort), [all, filter, sort]);

  const gone = all.filter((r) => brandState(r.brand) === "discontinued");
  const goneRatings = gone.reduce((sum, r) => sum + r.n, 0);

  // A second press on the same column reverses it; a new column starts the way
  // that column is usually read.
  const handleSort = (key: BrandSortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, direction: s.direction === "asc" ? "desc" : "asc" }
        : { key, direction: firstDirectionFor(key) },
    );

  return (
    <StoryLayout>
      <Seo
        title="Every brand on the board — Milk Me Not"
        description="All the makers behind the plant milks people have rated: who owns them, whether they are a supermarket own-label, how many ratings each has, and which ones you can no longer buy."
        path="/brands"
      />

      <Band ground="cream" size="lg">
        {/* Kicker and Display rather than SectionHead, which renders an h2 —
            and this is the top of its own page, so it wants the h1. */}
        <Kicker>Who makes it</Kicker>
        <Display as="h1" size="lg" className="mt-4 max-w-2xl">
          {all.length ? `${all.length} brands have been drunk and argued about` : "Every brand on the board"}
        </Display>
        <Lede className="mt-4 max-w-2xl">
          Some are supermarket own-labels you can only buy in one chain, some belong to companies you would recognise,
          and{" "}
          {gone.length > 0 ? (
            <>
              {gone.length === 1 ? "one" : gone.length} of them {gone.length === 1 ? "has" : "have"} stopped selling
              altogether — {goneRatings} rating{goneRatings === 1 ? "" : "s"} for drinks you can no longer buy.
            </>
          ) : (
            <>a few have stopped selling altogether.</>
          )}
        </Lede>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {KIND_FILTERS.map((k) => {
            const active = filter.kind === k.value;
            return (
              <button
                key={k.label}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter((f) => ({ ...f, kind: k.value }))}
                className={cn(
                  PILL,
                  active
                    ? "border-story-green bg-story-green text-white"
                    : "border-story-ink/12 bg-white text-story-ink-2 hover:bg-story-cream-2",
                )}
              >
                {k.label}
              </button>
            );
          })}

          <span className="mx-1 hidden h-6 w-px bg-story-ink/10 sm:block" aria-hidden />

          <button
            type="button"
            aria-pressed={filter.goneOnly}
            onClick={() => setFilter((f) => ({ ...f, goneOnly: !f.goneOnly }))}
            className={cn(
              PILL,
              filter.goneOnly
                ? "border-story-amber-dark bg-story-amber-light text-story-amber-dark"
                : "border-story-ink/12 bg-white text-story-ink-2 hover:bg-story-cream-2",
            )}
          >
            Discontinued only
          </button>

          {isFiltered(filter) && (
            <button
              type="button"
              onClick={() => setFilter(NO_FILTER)}
              className="px-2 text-[0.8125rem] font-bold text-story-muted underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="story-hairline mt-8 h-96 animate-pulse rounded-3xl bg-white" aria-hidden />
        ) : (
          <div className="story-hairline mt-8 rounded-[1.25rem] bg-white px-4 pb-2 pt-4 sm:px-6">
            <BrandSortHeader sort={sort} onSort={handleSort} />
            {rows.length ? (
              <BrandTable rows={rows} />
            ) : (
              <p className="py-12 text-center text-[0.9375rem] font-medium text-story-muted">
                No brands match that. <button type="button" onClick={() => setFilter(NO_FILTER)} className="font-bold text-story-green-dark underline-offset-2 hover:underline">Clear the filters</button> to see all {all.length}.
              </p>
            )}
          </div>
        )}

        <p className="mt-6 max-w-2xl text-[0.8125rem] font-medium text-story-muted-2">
          {isFiltered(filter) && (
            <>
              Showing {rows.length} of {all.length}.{" "}
            </>
          )}
          A brand with no badge is one nobody has checked, not one we know is fine. “Last rated” is when the board last
          heard about it, which is a sign of life rather than proof of one. Averages here include every rating, however
          few — see{" "}
          <Link to="/results" className="font-bold text-story-green-dark">
            the scoreboard
          </Link>{" "}
          for the ranking that requires a real sample.
        </p>
      </Band>
    </StoryLayout>
  );
};

export default Brands;
