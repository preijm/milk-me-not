
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  // The price value might be empty to allow for no selection
  const priceValue = price || "";

  const handlePriceChange = (value: string) => {
    // If value is empty or the same as current (toggle off), reset it
    const newValue = value === price ? "" : value;
    setPrice(newValue);
    
    // Mark as changed even when deselecting
    if (!hasChanged) {
      setHasChanged(true);
    }
  };

  const getPriceLabel = (value: string) => {
    switch (value) {
      case "1":
        return "❌ Total waste of money";
      case "2":
        return "⚠️ Not worth it";
      case "3":
        return "✅ Fair price";
      case "4":
        return "🏆 Good deal";
      case "5":
        return "💎 Great value for money";
      default:
        return "Select a price rating";
    }
  };

  return (
    <div className="space-y-4 w-full">
      <ToggleGroup 
        type="single" 
        value={priceValue} 
        onValueChange={handlePriceChange}
        className="flex flex-wrap justify-between gap-2 w-full"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <ToggleGroupItem 
            key={value} 
            value={value.toString()}
            className="flex-1 py-2 border rounded-md data-[state=on]:bg-cream-300 data-[state=on]:text-milk-500 min-w-16"
            aria-label={`Rating ${value}`}
          >
            <span className="text-sm font-medium">
              {getPriceLabel(value.toString()).split(" ")[0]}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
