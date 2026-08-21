import { Link } from "react-router-dom";
import { BrandMark, ScoreMark, getTier } from "@/components/story";
import { humanizeLabels } from "@/lib/labels";
import type { AggregatedResult } from "@/hooks/useAggregatedResults";

type ResultsCardListProps = {
  results: AggregatedResult[];
};

/**
 * The mobile browsing surface: a designed stack of cards, not a shrunken
 * table. Each card leads with brand + product, then the score — the biggest
 * thing on the card — with its tier spelled out underneath.
 */
export const ResultsCardList = ({ results }: ResultsCardListProps) => (
  <ol className="flex flex-col gap-3">
    {results.map((r, i) => {
      const tier = getTier(r.avg_rating);
      const tags = [
        ...(r.is_barista ? ["Barista"] : []),
        ...humanizeLabels(r.property_names),
        ...humanizeLabels(r.flavor_names),
      ].slice(0, 3);
      return (
        <li key={r.product_id}>
          {/* A real link, not a click handler. These rows are how a product
              page is found — by a person opening one in a new tab to compare,
              by someone sending a friend a carton, and by a search engine,
              which cannot follow an onClick at all. */}
          <Link
            to={`/product/${r.product_id}`}
            className="story-hairline flex w-full items-center gap-3.5 rounded-[1.25rem] bg-white p-4 text-left no-underline"
          >
            <span className="story-num flex-shrink-0 text-[1.05rem] leading-none text-story-muted-2">{i + 1}</span>
            <BrandMark
              brand={r.brand_name}
              product={r.product_name}
              hint={`${(r.property_names ?? []).join(" ")} ${(r.flavor_names ?? []).join(" ")}`}
              className="h-12 w-12 text-[0.75rem]"
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-story-muted-2">
                {r.brand_name}
              </span>
              <span className="block truncate font-sans text-[0.9375rem] font-bold text-story-ink">{r.product_name}</span>
              {tags.length > 0 && (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full bg-story-ink/[0.05] px-2 py-0.5 text-[0.625rem] font-bold text-story-muted">
                      {t}
                    </span>
                  ))}
                </span>
              )}
              <span className="mt-1.5 block text-[0.75rem] font-medium text-story-muted-2">
                {r.count} rating{r.count === 1 ? "" : "s"}
              </span>
            </span>

            <span className="flex flex-shrink-0 flex-col items-end gap-1">
              <ScoreMark score={r.avg_rating} size="md" showTier={false} />
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.1em]" style={{ color: tier.color }}>
                {tier.name}
              </span>
            </span>
          </Link>
        </li>
      );
    })}
  </ol>
);
