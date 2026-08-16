import { cn } from "@/lib/utils";
import { getBrandLogo } from "@/lib/brandLogo";
import { inferPlantBase } from "@/lib/plantBase";

type BrandMarkProps = {
  brand: string | null | undefined;
  /** Product name, used to infer the plant base when there is no logo. */
  product?: string | null;
  /** Extra text to help the base inference — properties, flavours. */
  hint?: string;
  /** Tailwind size classes for the tile, e.g. "h-14 w-14". */
  className?: string;
  /** Rounding, so a dense row can differ from a card. */
  radius?: string;
};

/**
 * The mark that stands in for a product shot.
 *
 * A real brand logo where we have one — that is the most recognisable thing we
 * can put on a row, and the reason someone spots their usual carton in a list
 * of 220. Where we don't, the plant base as three letters in the display face,
 * coloured by base, which keeps a long list varied instead of stamping one
 * icon down the page.
 *
 * Add logos by dropping files into `src/assets/brand-logos/`.
 */
export const BrandMark = ({ brand, product, hint, className, radius = "rounded-2xl" }: BrandMarkProps) => {
  const logo = getBrandLogo(brand);

  if (logo) {
    return (
      <span
        className={cn(
          "story-hairline flex flex-shrink-0 items-center justify-center overflow-hidden bg-white p-1.5",
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

  const base = inferPlantBase(`${brand ?? ""} ${product ?? ""} ${hint ?? ""}`);
  return (
    <span
      className={cn(
        "story-serif flex flex-shrink-0 items-center justify-center font-extrabold tracking-[0.02em]",
        radius,
        base.bg,
        base.fg,
        className,
      )}
      title={base.label}
    >
      {base.abbr}
    </span>
  );
};

export default BrandMark;
