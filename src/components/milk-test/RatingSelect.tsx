import React, { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { getTier } from "@/components/story/tiers";
import { cn } from "@/lib/utils";

interface RatingSelectProps {
  rating: number;
  setRating: (rating: number) => void;
}

const clamp = (n: number) => Math.min(Math.max(Math.round(n * 10) / 10, 0), 10);

const Nudge = ({
  dir,
  onClick,
  disabled,
}: {
  dir: "down" | "up";
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={dir === "up" ? "Increase by a tenth" : "Decrease by a tenth"}
    className={cn(
      "story-hairline flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white",
      "text-story-ink transition-colors hover:bg-story-cream-2 disabled:opacity-40",
    )}
  >
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden>
      <path
        d={dir === "up" ? "M12 5v14M5 12h14" : "M5 12h14"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </button>
);

/**
 * The score, which is the only thing this whole form exists to collect.
 *
 * It stays a 0–10 scale in tenths: of 200 sampled ratings only a quarter are
 * whole numbers and well over half are finer than a half-point, so rounding the
 * scale to ten taps would throw away the precision people are actually using.
 *
 * What changes is reaching a value. The thumb was a 25x28px emoji on a 101-step
 * track — roughly three pixels per step, which no thumb can place — and the
 * exact number could only be typed by discovering that a small badge was
 * secretly a button. Now the slider is for the rough position, the tenths
 * buttons are for the last nudge, and the number itself is a visible field.
 */
export const RatingSelect = ({ rating, setRating }: RatingSelectProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const tier = getTier(rating);
  const scored = rating > 0;

  const commit = () => {
    if (draft === null) return;
    const n = parseFloat(draft);
    setRating(draft.trim() === "" || isNaN(n) ? 0 : clamp(n));
    setDraft(null);
  };

  return (
    // Score block beside the controls rather than stacked above them: the taller
    // thumb and the tenths buttons both have to fit without pushing the submit
    // button further down the page than the control they replaced.
    <div className="flex items-center gap-3">
      <label
        className="flex h-[4.5rem] w-[4.5rem] shrink-0 cursor-text flex-col items-center justify-center rounded-2xl transition-colors"
        style={{ backgroundColor: scored ? tier.color : undefined }}
      >
        <span className="sr-only">Score out of 10</span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Score out of 10"
          value={draft ?? (scored ? rating.toFixed(1) : "")}
          placeholder="—"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d{0,2}(\.\d?)?$/.test(v)) setDraft(v);
          }}
          onFocus={() => setDraft(scored ? String(rating) : "")}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className={cn(
            "story-num h-11 w-full bg-transparent text-center text-[1.6rem] leading-none outline-none",
            scored ? "text-white placeholder:text-white/60" : "text-story-muted-2",
          )}
        />
        <span
          className={cn(
            "-mt-1 text-[0.5625rem] font-extrabold uppercase tracking-[0.12em]",
            scored ? "text-white/85" : "text-story-muted-2",
          )}
        >
          {scored ? tier.name : "of 10"}
        </span>
      </label>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-[0.8125rem] font-bold text-story-ink-2">
          {scored ? tier.blurb : "Drag, nudge, or type it."}
        </p>
        <div className="flex items-center gap-1">
          <Nudge dir="down" disabled={rating <= 0} onClick={() => setRating(clamp(rating - 0.1))} />
          <SliderPrimitive.Root
            value={[rating]}
            onValueChange={(v) => setRating(clamp(v[0]))}
            min={0}
            max={10}
            step={0.1}
            aria-label="Score"
            className="relative flex flex-1 touch-none select-none items-center py-2"
          >
            <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-story-cream-3">
              <SliderPrimitive.Range
                className="absolute h-full rounded-full transition-colors"
                style={{ backgroundColor: scored ? tier.color : "transparent" }}
              />
            </SliderPrimitive.Track>
            {/* 44px of touchable thumb, with a smaller visible disc inside it. */}
            <SliderPrimitive.Thumb
              className={cn(
                "flex h-11 w-11 cursor-grab touch-none select-none items-center justify-center rounded-full active:cursor-grabbing",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-2 focus-visible:ring-offset-story-cream",
              )}
            >
              <span
                className="block h-6 w-6 rounded-full border-[3px] border-white bg-story-ink shadow-[0_2px_8px_rgba(27,36,33,0.35)]"
                style={scored ? { backgroundColor: tier.color } : undefined}
              />
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>
          <Nudge dir="up" disabled={rating >= 10} onClick={() => setRating(clamp(rating + 0.1))} />
        </div>
      </div>
    </div>
  );
};
