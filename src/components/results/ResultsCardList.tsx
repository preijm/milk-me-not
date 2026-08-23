import { Link } from "react-router-dom";
import { ScoreMark, getTier } from "@/components/story";
import { ProductIdentity } from "@/components/story/ProductIdentity";
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
            <span className="story-num shrink-0 text-[1.05rem] leading-none text-story-muted-2">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <ProductIdentity
                brand={r.brand_name}
                product={r.product_name}
                properties={r.property_names}
                flavors={r.flavor_names}
                isBarista={r.is_barista}
                size="md"
                badgesBelow
              />
            </span>

            {/* The count sits with the score rather than trailing the badges.
                It is what the score is worth — 9.0 from one rating and 9.0 from
                thirty are different claims — and on the badge line it was
                arbitrary furniture competing for the 5px that made a flavour
                render as "Pumpkin spic…". */}
            <span className="flex shrink-0 flex-col items-end gap-0.5">
              <ScoreMark score={r.avg_rating} size="md" showTier={false} />
              <span className="text-[0.625rem] font-bold uppercase tracking-widest" style={{ color: tier.color }}>
                {tier.name}
              </span>
              <span className="text-[0.6875rem] font-medium text-story-muted-2">
                {r.count} rating{r.count === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        </li>
      );
    })}
  </ol>
);
