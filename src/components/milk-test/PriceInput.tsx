
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
  hasChanged: boolean;
  setHasChanged: (hasChanged: boolean) => void;
}

export const PriceInput = ({
  price,
  setPrice,
  hasChanged,
  setHasChanged
}: PriceInputProps) => {
  const isMobile = useIsMobile();
  
  // Ensure price is a string and default to empty string if null/undefined
  const priceValue = price || "";

  const handlePriceChange = (value: string) => {
    // If the button is already selected, unselect it by setting empty string
    const newValue = value === priceValue ? "" : value;
    
    // Update the price with new value or empty string if unselecting
    setPrice(newValue);
    
    // Mark as changed if not already changed
    if (!hasChanged) {
      setHasChanged(true);
    }
    
    // For debugging
    console.log('Price quality ratio selected:', newValue);
  };

  const buttons = [
    {
      value: "waste_of_money",
      emoji: "🚫",
      label: "Total waste of money",
      shortLabel: "Waste",
      activeClass: "bg-white text-score-poor border-score-poor",
    },
    {
      value: "not_worth_it",
      emoji: "⚠️",
      label: "Not worth it",
      shortLabel: "Poor",
      activeClass: "bg-white text-score-fair border-score-fair",
    },
    {
      value: "fair_price",
      emoji: "✅",
      label: "Fair price",
      shortLabel: "Fair",
      activeClass: "bg-white text-score-excellent border-score-excellent",
    },
    {
      value: "good_deal",
      emoji: "🏆",
      label: "Good deal",
      shortLabel: "Good",
      activeClass: "bg-white text-score-fair border-score-fair",
    },
    {
      value: "great_value",
      emoji: "💎",
      label: "Great value for money",
      shortLabel: "Gem",
      activeClass: "bg-white text-score-good border-score-good",
    },
  ];

  // For debugging
  console.log('Price quality ratio value in PriceInput:', priceValue);

  return (
    <div className="grid grid-cols-5 gap-2">
      {buttons.map(({ value, emoji, label, shortLabel, activeClass }) => (
        <div key={value} className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => handlePriceChange(value)}
            className={`flex items-center justify-center py-3 px-2 rounded-lg border transition-all w-full ${
              priceValue === value
                ? `${activeClass} shadow-sm`
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
            aria-label={label}
          >
            <span className="text-xl">{emoji}</span>
          </button>
          <span className={`text-xs font-medium text-center ${
            priceValue === value ? "text-gray-900" : "text-gray-500"
          }`}>
            {shortLabel}
          </span>
        </div>
      ))}
    </div>
  );
};
