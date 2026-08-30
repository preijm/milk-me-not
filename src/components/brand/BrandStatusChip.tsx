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
/**
 * Labels answer "can I still buy this", because that is the question a reader
 * brought. "Not checked" was here first and described our own filing instead —
 * two words that could equally have been a warning, a verdict or a bug. Where
 * there is room for a sentence, the brand page says it in one instead.
 */
const TONE: Record<BrandState, { label: string; title: string; className: string }> = {
  listed: {
    label: "Still sold",
    title: "Someone has checked that this is still on sale",
    className: "bg-story-cream-2 text-story-muted",
  },
  discontinued: {
    label: "Discontinued",
    title: "You cannot buy this any more",
    className: "bg-story-amber-light text-story-amber-dark",
  },
  unchecked: {
    label: "Not known",
    title: "Nobody has checked whether this is still on sale",
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
      title={tone.title}
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
