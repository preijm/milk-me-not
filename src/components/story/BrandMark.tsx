import { cn } from "@/lib/utils";
import { getBrandLogo, isFullBleedLogo } from "@/lib/brandLogo";
import { markFor } from "./userMarkTone";

type BrandMarkProps = {
  brand: string | null | undefined;
  /** Tailwind size classes for the tile, e.g. "h-14 w-14". */
  className?: string;
  /** Rounding, so a dense row can differ from a card. */
  radius?: string;
};

/**
 * Initials for a brand with no logo. "Oddly Good" is OG, "Auchan" is AU.
 *
 * Capitalised words win, so "Take it Veggie" is TV rather than TI — the
 * connector is not part of how anyone says the name.
 */
const brandInitials = (brand: string | null | undefined) => {
  const words = (brand ?? "").trim().split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length === 0) return "?";
  const named = words.filter((w) => w[0] === w[0].toUpperCase());
  const pick = named.length >= 2 ? named : words;
  if (pick.length >= 2) return (pick[0][0] + pick[1][0]).toUpperCase();
  return pick[0].slice(0, 2).toUpperCase();
};

/**
 * The mark that stands in for a product.
 *
 * A real brand logo where we have one — that is the most recognisable thing we
 * can put on a row, and the reason someone spots their usual carton in a list
 * of 220. We have 25, covering about three quarters of the board by volume.
 *
 * For the rest, the brand's initials. This used to show the plant base instead
 * — three letters like OAT, inferred from the name — which put "OAT" in the
 * slot where a brand logo goes, beside a row already reading "AUCHAN / Oat". It
 * named the wrong thing and repeated the product name while doing it. The
 * colour comes from the brand, the same derivation people's marks use, so a
 * long list still varies instead of stamping one tile down the page.
 *
 * Add logos by dropping files into `src/assets/brand-logos/`.
 */
export const BrandMark = ({ brand, className, radius = "rounded-2xl" }: BrandMarkProps) => {
  const logo = getBrandLogo(brand);

  if (logo) {
    // A logo that brings its own coloured panel goes edge to edge, with no
    // white ground to ring it; a mark on transparency gets that ground so it
    // still reads on a dark row, and a little air off the corners.
    //
    // Both scale with object-contain. Cropping a panel to fill the tile only
    // works when it is exactly square, and most are not — Edeka's roundel is
    // taller than it is wide, so covering the tile pushed its wordmark out of
    // the bottom edge.
    const fullBleed = isFullBleedLogo(brand);
    return (
      <span
        className={cn(
          "flex flex-shrink-0 items-center justify-center overflow-hidden",
          fullBleed ? "" : "story-hairline bg-white p-1",
          radius,
          className,
        )}
      >
        <img
          src={logo}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  const name = (brand ?? "").trim();
  const tone = markFor(name);
  return (
    <span
      className={cn(
        "story-serif flex flex-shrink-0 items-center justify-center font-extrabold tracking-[0.02em]",
        radius,
        tone.bg,
        tone.fg,
        className,
      )}
      title={name || undefined}
    >
      {brandInitials(name)}
    </span>
  );
};

export default BrandMark;
