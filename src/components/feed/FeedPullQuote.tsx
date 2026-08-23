import { Link } from "react-router-dom";
import { ArrowRight, Band, Kicker, MilkDrop, getTier } from "@/components/story";
import { cn } from "@/lib/utils";
import type { MilkTestResult } from "@/types/milk-test";

type FeedPullQuoteProps = {
  items: MilkTestResult[];
  className?: string;
};

/**
 * A second shape between the hero and the card stream — one real tasting
 * note set at editorial scale, not another repeated card. Picks the
 * best-scored note actually left by someone in the window currently loaded,
 * so it changes as the real feed changes.
 */
export const FeedPullQuote = ({ items, className }: FeedPullQuoteProps) => {
  const withNotes = items.filter((i) => !!i.notes?.trim());
  const pool = withNotes.length > 0 ? withNotes : items;
  const featured = [...pool].sort((a, b) => b.rating - a.rating)[0];
  if (!featured) return null;

  const tier = getTier(featured.rating);

  return (
    <Band ground="forest" size="md" className={cn(className)}>
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 text-story-green opacity-40">
        <MilkDrop size={280} variant="solid" />
      </div>
      <div className="relative max-w-3xl">
        <Kicker tone="light">Verdict of the moment</Kicker>
        <p className="story-serif mt-6 text-[clamp(1.5rem,4.2vw,2.75rem)] italic leading-[1.22] text-white">
          {featured.notes ? `“${featured.notes}”` : `“${tier.blurb}”`}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="story-num text-[2rem] leading-none" style={{ color: tier.color }}>
            {featured.rating.toFixed(1)}
          </span>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: tier.color }}>
            {tier.name}
          </span>
          <span className="hidden text-white/40 sm:inline">·</span>
          <span className="text-[0.9375rem] font-medium text-white/70" translate="no">
            {featured.brand_name ?? "Unknown brand"} · {featured.product_name ?? "Unknown product"}
          </span>
          {featured.username && (
            <>
              <span className="hidden text-white/40 sm:inline">·</span>
              <span className="text-[0.9375rem] font-medium text-white/70" translate="no">
                {featured.username}
              </span>
            </>
          )}
        </div>
        {featured.product_id && (
          <Link
            to={`/product/${featured.product_id}`}
            className="relative mt-7 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-story-green-light no-underline hover:underline"
          >
            See the full verdict
            <ArrowRight />
          </Link>
        )}
      </div>
    </Band>
  );
};
