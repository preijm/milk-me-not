
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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
  // Ensure price is a string and default to empty string if null/undefined
  const priceValue = price || "";

  const handlePriceChange = (value: string) => {
    // Always update the price when a button is clicked
    setPrice(value);
    
    // Mark as changed if not already changed
    if (!hasChanged) {
      setHasChanged(true);
    }
    
    // For debugging
    console.log('Price quality ratio selected:', value);
  };

  const getPriceTooltip = (value: string) => {
    switch (value) {
      case "1":
        return "Total waste of money";
      case "2":
        return "Not worth it";
      case "3":
        return "Fair price";
      case "4":
        return "Good deal";
      case "5":
        return "Great value for money";
      default:
        return "";
    }
  };

  const getPriceEmoji = (value: string) => {
    switch (value) {
      case "1":
        return "❌";
      case "2":
        return "⚠️";
      case "3":
        return "✅";
      case "4":
        return "🏆";
      case "5":
        return "💎";
      default:
        return null;
    }
  };

  // For debugging
  console.log('Price quality ratio value in PriceInput:', priceValue);

  return (
    <div className="space-y-4 w-full">
      <TooltipProvider>
        <ToggleGroup 
          type="single" 
          value={priceValue} 
          onValueChange={handlePriceChange}
          className="flex flex-wrap justify-between gap-2 w-full"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value={value.toString()}
                  className="flex-1 py-2 border rounded-md data-[state=on]:bg-cream-300 data-[state=on]:text-milk-500 min-w-16 flex items-center justify-center"
                  aria-label={`Rating ${value}`}
                >
                  <span className="text-xl">{getPriceEmoji(value.toString())}</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getPriceTooltip(value.toString())}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </TooltipProvider>
    </div>
  );
};
