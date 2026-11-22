import { Link } from "react-router-dom";
import { ScoreMark, getTier } from "@/components/story";
import { BrandMark } from "@/components/story/BrandMark";
import { ProductIdentity } from "@/components/story/ProductIdentity";
import type { AggregatedResult } from "@/hooks/useAggregatedResults";

type ResultsCardListProps = {
  results: AggregatedResult[];
  /**
   * Whether the list is actually a ranking, which is the only time a position
   * number is true. See the note on the rank below.
   */
  ranked?: boolean;
};

/**
 * The mobile browsing surface: a designed stack of cards, not a shrunken
 * table. Each card leads with brand + product, then the score — the biggest
 * thing on the card — with its tier spelled out underneath.
 */
export const ResultsCardList = ({ results, ranked = false }: ResultsCardListProps) => (
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
            {/* The rank appears only when the list is genuinely a ranking.

                It is the row's position in the current sort, so under "Highest
                score" it is the board position and means something. Under
                "Brand A–Z" it was a row counter wearing a rank's clothes: a #1
                beside a brand starting with A reads as the best plant milk on
                the site, and it only got there alphabetically. Under "Lowest
                score" it is a rank counted from the wrong end. So it shows for
                the one sort that makes it true — which is also the default.

                It stacks above the mark rather than sitting beside it. Beside
                it, it was a column that changed width with the number: 10px at
                rank 9, 19px at rank 10, 28px at rank 100, so the product name
                started at a different x depending on how far down the board
                you had scrolled, and the width it took was the width the badge
                line needed. Above the mark it costs nothing — "#226" is 26px
                against the mark's 48 — and it stays on the left, where you
                look for a position. */}
            <span className="flex shrink-0 flex-col items-center gap-1">
              {ranked && (
                <span className="story-num text-[0.6875rem] leading-none text-story-muted-2">#{i + 1}</span>
              )}
              <BrandMark brand={r.brand_name} className="h-12 w-12 text-[0.75rem]" radius="rounded-xl" />
            </span>
            <span className="min-w-0 flex-1">
              {/* Badges get a row of their own here, as they do on the mobile
                  feed card. Sharing the name's line put the second pill under
                  the middle of the product name, so a column of rows had a
                  ragged left edge that moved with the length of each name —
                  and a name plus two pills does not fit beside itself on a
                  350px row anyway.

                  Measured across the board's first forty rows: badge lines
                  that wrap went from seven to two with this, and to none once
                  the rank gave up its column above. */}
              <ProductIdentity
                brand={r.brand_name}
                product={r.product_name}
                properties={r.property_names}
                flavors={r.flavor_names}
                isBarista={r.is_barista}
                size="md"
                showMark={false}
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
              <span className="text-[0.625rem] font-bold uppercase tracking-widest" style={{ color: tier.ink }}>
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
