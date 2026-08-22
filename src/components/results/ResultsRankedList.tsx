import { Link } from "react-router-dom";
import { ArrowRight, ScoreMark } from "@/components/story";
import { ProductIdentity } from "@/components/story/ProductIdentity";
import { cn } from "@/lib/utils";
import type { AggregatedResult, SortConfig } from "@/hooks/useAggregatedResults";

type ResultsRankedListProps = {
  results: AggregatedResult[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
};

const HEADERS: { column: string; label: string; className: string }[] = [
  { column: "product_name", label: "Product", className: "flex-1 min-w-0" },
  { column: "count", label: "Ratings", className: "w-24 flex-shrink-0 justify-end" },
  { column: "avg_rating", label: "Score", className: "w-44 flex-shrink-0 justify-end" },
];

/**
 * The desktop ranking: a dense, edge-to-edge list where the score is the
 * biggest thing on the row and its tier is legible without hovering.
 */
export const ResultsRankedList = ({ results, sortConfig, onSort }: ResultsRankedListProps) => (
  <div>
    <div className="flex items-center gap-4 border-b-2 border-story-ink/10 pb-3">
      <span className="w-10 flex-shrink-0" aria-hidden />
      <span className="w-14 flex-shrink-0" aria-hidden />
      {HEADERS.map((h) => (
        <button
          key={h.column}
          type="button"
          onClick={() => onSort(h.column)}
          className={cn("story-kicker flex items-center gap-1 text-story-muted-2 transition-colors hover:text-story-ink", h.className)}
        >
          {h.label}
          {sortConfig.column === h.column && <span aria-hidden>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
        </button>
      ))}
      <span className="w-[18px] flex-shrink-0" aria-hidden />
    </div>

    <ol className="flex flex-col">
      {results.map((r, i) => {
        return (
          <li key={r.product_id} className="border-b border-story-ink/[0.08]">
            {/* A real link, so a row can be opened in a tab, copied, shared
                and crawled. The sort headers above stay buttons: they change
                this page rather than going anywhere. */}
            <Link
              to={`/product/${r.product_id}`}
              className="group flex w-full items-center gap-4 py-5 text-left no-underline"
            >
              <span className="story-num w-10 flex-shrink-0 text-[1.35rem] leading-none text-story-muted-2">{i + 1}</span>
              {/* This view used to drop flavours entirely — properties only —
                  so three Oatly rows differing only by flavour were identical
                  here. */}
              <ProductIdentity
                brand={r.brand_name}
                product={r.product_name}
                properties={r.property_names}
                flavors={r.flavor_names}
                isBarista={r.is_barista}
                size="lg"
                className="flex-1"
              />

              <span className="w-24 flex-shrink-0 text-right font-sans text-[0.9375rem] font-bold text-story-muted">
                {r.count}
              </span>

              <ScoreMark
                score={r.avg_rating}
                size="md"
                className="w-44 flex-shrink-0 flex-row items-baseline justify-end gap-2.5"
              />

              <ArrowRight className="flex-shrink-0 text-story-muted-2" />
            </Link>
          </li>
        );
      })}
    </ol>
  </div>
);
