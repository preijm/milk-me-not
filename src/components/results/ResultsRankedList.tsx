import { ArrowRight, BrandMark, ScoreMark } from "@/components/story";
import { humanizeLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { AggregatedResult, SortConfig } from "@/hooks/useAggregatedResults";

type ResultsRankedListProps = {
  results: AggregatedResult[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onProductClick: (productId: string) => void;
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
export const ResultsRankedList = ({ results, sortConfig, onSort, onProductClick }: ResultsRankedListProps) => (
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
        const tags = [...(r.is_barista ? ["Barista"] : []), ...humanizeLabels(r.property_names)].slice(0, 3);
        return (
          <li key={r.product_id} className="border-b border-story-ink/[0.08]">
            <button
              type="button"
              onClick={() => onProductClick(r.product_id)}
              className="group flex w-full items-center gap-4 py-5 text-left"
            >
              <span className="story-num w-10 flex-shrink-0 text-[1.35rem] leading-none text-story-muted-2">{i + 1}</span>
                            <BrandMark
                brand={r.brand_name}
                product={r.product_name}
                hint={`${(r.property_names ?? []).join(" ")} ${(r.flavor_names ?? []).join(" ")}`}
                className="h-14 w-14 text-[0.8125rem]"
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-base">
                  <span className="font-medium text-story-muted">{r.brand_name}</span>
                  <span className="mx-1.5 text-story-muted-2">·</span>
                  <span className="font-bold text-story-ink group-hover:underline">{r.product_name}</span>
                </span>
                {tags.length > 0 && (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t} className="rounded-full bg-story-ink/[0.05] px-2 py-0.5 text-[0.6875rem] font-bold text-story-muted">
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className="w-24 flex-shrink-0 text-right font-sans text-[0.9375rem] font-bold text-story-muted">
                {r.count}
              </span>

              <ScoreMark
                score={r.avg_rating}
                size="md"
                className="w-44 flex-shrink-0 flex-row items-baseline justify-end gap-2.5"
              />

              <ArrowRight className="flex-shrink-0 text-story-muted-2" />
            </button>
          </li>
        );
      })}
    </ol>
  </div>
);
