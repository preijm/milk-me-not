import { inferPlantBase } from "@/lib/plantBase";
import { humanizeLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface FeedProductInfoProps {
  brandName: string;
  productName: string;
  isBarista?: boolean;
  propertyNames?: string[];
  flavorNames?: string[];
}

const PILL = "rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.04em]";

/**
 * The product line of a verdict card: brand + name, a three-letter plant-base
 * mark for row-to-row variety (the same device the results list uses instead
 * of per-ingredient icons), and the tags a shopper would actually scan for.
 * Raw property/flavour keys always go through `humanizeLabel` first — a
 * reader should never see a database column value.
 */
export const FeedProductInfo = ({
  brandName,
  productName,
  isBarista,
  propertyNames,
  flavorNames,
}: FeedProductInfoProps) => {
  const base = inferPlantBase(`${brandName} ${productName} ${(propertyNames ?? []).join(" ")}`);
  const properties = humanizeLabels(propertyNames).slice(0, 2);
  const flavors = humanizeLabels(flavorNames).slice(0, 1);
  const hasTags = isBarista || properties.length > 0 || flavors.length > 0;

  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "story-num flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[0.6875rem] font-extrabold tracking-[0.02em]",
          base.bg,
          base.fg,
        )}
        title={base.label}
        aria-hidden
      >
        {base.abbr}
      </span>
      <div className="min-w-0 flex-1">
        <p className="story-serif truncate text-[1.0625rem] font-bold leading-snug text-story-ink" translate="no">
          {brandName} - {productName}
        </p>
        {hasTags && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {isBarista && <span className={cn(PILL, "bg-story-green text-white")}>Barista</span>}
            {properties.map((label) => (
              <span key={label} className={cn(PILL, "bg-story-ink/[0.06] text-story-muted")}>
                {label}
              </span>
            ))}
            {flavors.map((label) => (
              <span key={label} className={cn(PILL, "bg-story-amber-light text-story-amber-dark")}>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
