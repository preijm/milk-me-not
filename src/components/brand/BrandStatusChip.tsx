import { cn } from "@/lib/utils";
import type { BrandState } from "@/lib/brandFacts";

/**
 * Three states, and the third one is the reason this component exists.
 *
 * "Unchecked" is drawn as an outline rather than a fill, so it reads as an
 * absence of information instead of a verdict. If it were quietly omitted, or
 * rendered as a green tick, the page would claim every brand nobody has looked
 * at is still trading — which is most of the board.
 *
 * Discontinued uses amber, because this palette has no red on purpose and
 * amber is what carries every warning on the site.
 */
const TONE: Record<BrandState, { label: string; className: string }> = {
  listed: {
    label: "Still listed",
    className: "bg-story-cream-2 text-story-muted",
  },
  discontinued: {
    label: "Discontinued",
    className: "bg-story-amber-light text-story-amber-dark",
  },
  unchecked: {
    label: "Not checked",
    className: "border border-dashed border-story-ink/20 text-story-muted-2",
  },
};

export const BrandStatusChip = ({
  state,
  className,
}: {
  state: BrandState;
  className?: string;
}) => {
  const tone = TONE[state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em]",
        tone.className,
        className,
      )}
    >
      {tone.label}
    </span>
  );
};

export default BrandStatusChip;
