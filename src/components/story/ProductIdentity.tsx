import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { humanizeLabels } from "@/lib/labels";
import { BrandMark } from "./BrandMark";
import { BaristaGlyph } from "./motifs";

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
 * shop, score and who posted it are context — the caller arranges those around
 * this block and never inside it. The profile list broke that by printing
 * `brand — tasting note` as the second line, which read as part of the name and
 * left three Oatly rows titled "Oat" with nothing to tell them apart.
 *
 * Badges are identity, not decoration. Oatly Barista and Oatly Original are
 * different cartons, and the flavour is often the only thing separating two
 * otherwise identical rows.
 *
 * Brand sits above the product name rather than inline with it. When the row
 * runs out of room, an inline brand eats the product name — and the product
 * name is the half that distinguishes two cartons from the same brand.
 *
 * The badge line never wraps. On a phone the identity column gets about 142px
 * between the rank, the mark and the score, so two uppercase letter-spaced
 * pills were landing right on the edge of fitting: rows came out 104px, 120px
 * or 145px tall depending on how long a flavour happened to be, which read as
 * a ragged list. Sentence case is roughly a third narrower than uppercase with
 * tracking, `meta` puts the caller's one-liner on the same row rather than a
 * new one, and anything still over the count becomes `+N`.
 */

/** Everything that is not barista. See the note in the component. */
const NEUTRAL_PILL = "bg-story-ink/6 text-story-muted";

const SIZES = {
  sm: {
    mark: "h-10 w-10 text-[0.625rem]",
    radius: "rounded-xl",
    brand: "text-[0.625rem]",
    product: "text-[0.875rem]",
    pill: "px-1.5 py-0.25 text-[0.625rem]",
    meta: "text-[0.6875rem]",
    gap: "gap-2.5",
    badges: 3,
  },
  md: {
    mark: "h-12 w-12 text-[0.75rem]",
    radius: "rounded-xl",
    brand: "text-[0.6875rem]",
    product: "text-[0.9375rem]",
    pill: "px-2 py-[0.09375rem] text-[0.6875rem]",
    meta: "text-[0.75rem]",
    gap: "gap-3",
    badges: 3,
  },
  lg: {
    mark: "h-14 w-14 text-[0.8125rem]",
    radius: "rounded-2xl",
    brand: "text-[0.75rem]",
    product: "text-[1.0625rem]",
    pill: "px-2 py-0.5 text-[0.6875rem]",
    meta: "text-[0.8125rem]",
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
  /**
   * Override how many badges fit. Defaults to something sane for the size.
   *
   * The defaults went up by one when the badges started wrapping. They were
   * set by how much a single nowrap line could hold; now they are only a guard
   * against a carton with an absurd number of labels turning a row into four
   * lines. No row on the live board carries more than two.
   */
  maxBadges?: number;
  /**
   * One short piece of context to sit at the end of the badge line — "12
   * ratings", a date. It shares the row so it does not cost a line of its own.
   */
  meta?: ReactNode;
  /**
   * Something to sit at the end of the product name — an arrow, when the
   * identity is a link and there is no hover to reveal that with.
   */
  after?: ReactNode;
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
  meta,
  after,
  className,
}: ProductIdentityProps) => {
  const s = SIZES[size];
  const propertyLabels = humanizeLabels(properties);
  const flavorLabels = humanizeLabels(flavors);

  // Barista first, then flavour, then the rest: flavour is what separates two
  // rows of the same carton, so it should not be the badge that gets cut.
  //
  // One colour, and it is barista's. Flavour was amber and properties were
  // grey, which made the row a little traffic light of three palettes for
  // facts of quite different weight — "Pumpkin spice" is a variant, "Barista"
  // is what the carton is *for*. Everything except barista is the same neutral
  // now, so the coloured pill in a row means one thing. It is coffee-coloured
  // rather than brand green for the obvious reason, and for a less obvious
  // one: white on --story-green is 2.48:1, and on --story-coffee it is 9.37:1.
  const badges: { key: string; label: string; tone: string; icon?: boolean }[] = [
    ...(isBarista ? [{ key: "barista", label: "Barista", tone: "bg-story-coffee-light text-story-coffee", icon: true }] : []),
    ...flavorLabels.map((label) => ({ key: `f:${label}`, label, tone: NEUTRAL_PILL })),
    ...propertyLabels.map((label) => ({ key: `p:${label}`, label, tone: NEUTRAL_PILL })),
  ];
  const shown = badges.slice(0, maxBadges ?? s.badges);
  const hidden = badges.length - shown.length;

  return (
    <span className={cn("flex min-w-0 items-center", s.gap, className)}>
      {showMark && <BrandMark brand={brand} className={cn("shrink-0", s.mark)} radius={s.radius} />}

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

        {/* Name and badges share one wrapping line, and the browser decides
            per row whether that is one line or two.

            It used to be decided once, for every row at once: `badgesBelow`
            dropped the badges onto their own line always, and the alternative
            was a nowrap line that truncated them to "Bari…" and "Hazel…".
            Measured across the 40 rows of the live board on a 375px phone —
            29 of them carry badges — 22 of those 29 have room for *all* their
            badges beside the name, and 28 of 29 have room for the first. One
            row in twenty-nine genuinely needs the second line. Flex wrap gives
            that row its second line and gives the other twenty-eight their
            first line back, with no measuring on our side.

            The name and whatever follows it are one flex item, so an arrow
            never wraps away from the word it belongs to, and `max-w-full`
            keeps a very long name ellipsised rather than overflowing. */}
        <span className={cn("mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1",)}>
          <span className="flex max-w-full shrink-0 items-center gap-1">
            {/* `story-product-name` carries no styles of its own. It is a hook,
                so a caller that wraps this in a link can underline the words on
                hover without reaching through the layout — see the feed card.
                A class rather than a data attribute because Tailwind's
                arbitrary variants will not parse the nested brackets that
                `[&:hover_[data-product-name]]` needs: it emits no rule at all,
                silently. */}
            <span
              className={cn("story-product-name min-w-0 truncate font-sans font-bold text-story-ink", s.product)}
              translate="no"
            >
              {product || "Unknown product"}
            </span>
            {after}
          </span>

          {shown.map((b) => (
            <span
              key={b.key}
              className={cn("flex max-w-full shrink-0 items-center gap-1 rounded-full font-bold", s.pill, b.tone)}
            >
              {b.icon && <BaristaGlyph className="shrink-0" size={11} />}
              <span className="truncate">{b.label}</span>
            </span>
          ))}

          {hidden > 0 && <span className={cn("shrink-0 font-bold text-story-muted-2", s.pill)}>+{hidden}</span>}

          {meta && (
            <span className={cn("min-w-0 shrink truncate text-story-muted-2", s.meta)}>{meta}</span>
          )}
        </span>
      </span>
    </span>
  );
};

export default ProductIdentity;
