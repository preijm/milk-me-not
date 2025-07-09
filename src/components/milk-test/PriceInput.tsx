
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
      activeClass: "bg-white text-[#ff4b51] border-[#ff4b51]",
    },
    {
      value: "not_worth_it",
      emoji: "⚠️",
      label: "Not worth it",
      activeClass: "bg-white text-[#f59e0b] border-[#f59e0b]",
    },
    {
      value: "fair_price",
      emoji: "✅",
      label: "Fair price",
      activeClass: "bg-white text-[#2144ff] border-[#2144ff]",
    },
    {
      value: "good_deal",
      emoji: "🏆",
      label: "Good deal",
      activeClass: "bg-white text-[#00bf63] border-[#00bf63]",
    },
    {
      value: "great_value",
      emoji: "💎",
      label: "Great value for money",
      activeClass: "bg-white text-[#00bf63] border-[#00bf63]",
    },
  ];

  // For debugging
  console.log('Price quality ratio value in PriceInput:', priceValue);

  return (
    <div className="grid grid-cols-5 gap-2">
      {isMobile ? (
        // Mobile view using HoverCard
        buttons.map(({ value, emoji, label, activeClass }) => (
          <HoverCard key={value}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                onClick={() => handlePriceChange(value)}
                className={`flex items-center justify-center py-3 px-2 rounded-lg border-2 transition-all cursor-default ${
                  priceValue === value
                    ? `${activeClass} shadow-sm`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                aria-label={label}
              >
                <span className="text-xl">{emoji}</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="p-2 text-center">
              <p>{label}</p>
            </HoverCardContent>
          </HoverCard>
        ))
      ) : (
        // Desktop view using Tooltip
        <TooltipProvider>
          {buttons.map(({ value, emoji, label, activeClass }) => (
            <Tooltip key={value} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handlePriceChange(value)}
                  className={`flex items-center justify-center py-3 px-2 rounded-lg border-2 transition-all cursor-default ${
                    priceValue === value
                      ? `${activeClass} shadow-sm`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                  aria-label={label}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      )}
    </div>
  );
};
