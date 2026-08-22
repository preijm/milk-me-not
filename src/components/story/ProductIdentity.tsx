import { cn } from "@/lib/utils";
import { humanizeLabels } from "@/lib/labels";
import { BrandMark } from "./BrandMark";

/**
 * How this project names a product, everywhere.
 *
 * There were eight renderings of the same four facts. Brand and product were
 * joined by " - " on the feed, " · " on the ranked board and in the pull quote,
 * stacked on the board cards, and reversed on the profile list and in the scan
 * results. The type was serif in the feed and sans everywhere else. Badges
 * appeared on two of the eight surfaces, in two different palettes.
 *
 * The rule: a product is its mark, its brand, its name and its badges. Notes,
 * shop, score, rating count and who posted it are context — the caller arranges
 * those around this block and never inside it. The profile list broke that by
 * printing `brand — tasting note` as the second line, which read as part of the
 * name and left three Oatly rows titled "Oat" with nothing to tell them apart.
 *
 * Badges are identity, not decoration. Oatly Barista and Oatly Original are
 * different cartons, and the flavour is the only thing separating three otherwise
 * identical rows, so they belong here rather than being optional garnish.
 *
 * Brand sits above the product name rather than inline with it. When the row
 * runs out of room, an inline brand eats the product name — and the product
 * name is the half that distinguishes two cartons from the same brand.
 */

const SIZES = {
  sm: {
    mark: "h-10 w-10 text-[0.625rem]",
    radius: "rounded-xl",
    brand: "text-[0.625rem]",
    product: "text-[0.875rem]",
    pill: "px-2 py-0.5 text-[0.5625rem]",
    gap: "gap-2.5",
    badges: 2,
  },
  md: {
    mark: "h-12 w-12 text-[0.75rem]",
    radius: "rounded-xl",
    brand: "text-[0.6875rem]",
    product: "text-[0.9375rem]",
    pill: "px-2 py-0.5 text-[0.625rem]",
    gap: "gap-3",
    badges: 3,
  },
  lg: {
    mark: "h-14 w-14 text-[0.8125rem]",
    radius: "rounded-2xl",
    brand: "text-[0.75rem]",
    product: "text-[1.0625rem]",
    pill: "px-2.5 py-0.5 text-[0.6875rem]",
    gap: "gap-3.5",
    badges: 4,
  },
} as const;

export type ProductIdentitySize = keyof typeof SIZES;

type ProductIdentityProps = {
  brand?: string | null;
  product?: string | null;
  properties?: (string | null | undefined)[] | null;
  flavors?: (string | null | undefined)[] | null;
  isBarista?: boolean | null;
  size?: ProductIdentitySize;
  /** Drop the mark when the row already shows one, or shows a photo instead. */
  showMark?: boolean;
  /** Override how many badges fit. Defaults to something sane for the size. */
  maxBadges?: number;
  className?: string;
};

export const ProductIdentity = ({
  brand,
  product,
  properties,
  flavors,
  isBarista,
  size = "md",
  showMark = true,
  maxBadges,
  className,
}: ProductIdentityProps) => {
  const s = SIZES[size];
  const propertyLabels = humanizeLabels(properties);
  const flavorLabels = humanizeLabels(flavors);

  // Barista first, then flavour, then the rest: flavour is what separates two
  // rows of the same carton, so it should not be the badge that gets cut.
  const badges = [
    ...(isBarista ? [{ key: "barista", label: "Barista", tone: "bg-story-green text-white" }] : []),
    ...flavorLabels.map((label) => ({ key: `f:${label}`, label, tone: "bg-story-amber-light text-story-amber-dark" })),
    ...propertyLabels.map((label) => ({ key: `p:${label}`, label, tone: "bg-story-ink/[0.06] text-story-muted" })),
  ];
  const limit = maxBadges ?? s.badges;
  const shown = badges.slice(0, limit);
  const hidden = badges.length - shown.length;

  return (
    <span className={cn("flex min-w-0 items-center", s.gap, className)}>
      {showMark && (
        <BrandMark
          brand={brand}
          product={product}
          hint={[...propertyLabels, ...flavorLabels].join(" ")}
          className={cn("flex-shrink-0", s.mark)}
          radius={s.radius}
        />
      )}

      <span className="min-w-0 flex-1">
        {/* Kept even where a logo is showing: only 25 of 71 brands have one, so
            for a quarter of the board this line is the only thing naming who
            made it. */}
        <span
          className={cn("block truncate font-bold uppercase tracking-[0.08em] text-story-muted-2", s.brand)}
          translate="no"
        >
          {brand || "Unknown brand"}
        </span>

        <span className={cn("block truncate font-sans font-bold text-story-ink", s.product)} translate="no">
          {product || "Unknown product"}
        </span>

        {shown.length > 0 && (
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {shown.map((b) => (
              <span
                key={b.key}
                className={cn("rounded-full font-bold uppercase tracking-[0.04em]", s.pill, b.tone)}
              >
                {b.label}
              </span>
            ))}
            {hidden > 0 && (
              <span className={cn("font-bold text-story-muted-2", s.pill)}>+{hidden}</span>
            )}
          </span>
        )}
      </span>
    </span>
  );
};

export default ProductIdentity;
