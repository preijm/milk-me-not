import React from "react";
import { getPriceQuality } from "@/components/story/tiers";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
  hasChanged: boolean;
  setHasChanged: (hasChanged: boolean) => void;
}

/**
 * The five values the database stores, in order, worst to best.
 *
 * The colours come from the shared price-quality scale rather than being
 * restated here — the old buttons had drifted out of order, tinting "good deal"
 * with the same amber as "not worth it" and "fair price" with the strongest
 * green on the scale, so the row read as no scale at all.
 */
const CHOICES = [
  { value: "waste_of_money", short: "Waste", label: "Total waste of money" },
  { value: "not_worth_it", short: "Poor", label: "Not worth it" },
  { value: "fair_price", short: "Fair", label: "Fair price" },
  { value: "good_deal", short: "Good", label: "Good deal" },
  { value: "great_value", short: "Gem", label: "Great value for money" },
];

/** A five-bar meter: each step is one bar taller than the last. */
const Meter = ({ step, active }: { step: number; active: boolean }) => (
  <span className="flex h-5 items-end gap-[2px]" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className={cn("w-[3px] rounded-[1px] transition-colors", i <= step ? "opacity-100" : "opacity-25")}
        style={{ height: `${6 + i * 3}px`, backgroundColor: active ? "currentColor" : "hsl(var(--story-muted-2))" }}
      />
    ))}
  </span>
);

export const PriceInput = ({ price, setPrice, hasChanged, setHasChanged }: PriceInputProps) => {
  const priceValue = price || "";

  const handlePriceChange = (value: string) => {
    // Tapping the selected option again clears it — this is an optional field.
    setPrice(value === priceValue ? "" : value);
    if (!hasChanged) setHasChanged(true);
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {CHOICES.map(({ value, short, label }, i) => {
        const active = priceValue === value;
        const tier = getPriceQuality(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => handlePriceChange(value)}
            aria-label={label}
            aria-pressed={active}
            style={active && tier ? { backgroundColor: tier.light, color: tier.color, boxShadow: `inset 0 0 0 1.5px ${tier.color}` } : undefined}
            className={cn(
              "flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2.5 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-story-green focus-visible:ring-offset-2 focus-visible:ring-offset-story-cream",
              !active && "story-hairline bg-white text-story-muted hover:bg-story-cream-2",
            )}
          >
            <Meter step={i} active={active} />
            <span className={cn("text-[0.6875rem] font-bold", !active && "text-story-muted")}>{short}</span>
          </button>
        );
      })}
    </div>
  );
};
