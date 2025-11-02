
import React, { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { Input } from "@/components/ui/input";

interface RatingSelectProps {
  rating: number;
  setRating: (rating: number) => void;
}

const getRatingColor = (rating: number) => {
  if (rating >= 8.5) return "bg-[#00bf63]";
  if (rating >= 7.5) return "bg-[#2144ff]"; 
  if (rating >= 5.5) return "bg-[#f59e0b]";
  return "bg-[#ff4b51]";
};

export const RatingSelect = ({ rating, setRating }: RatingSelectProps) => {
  const [inputValue, setInputValue] = useState(rating > 0 ? rating.toString() : "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string or valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      
      // Only update the actual rating if it's a valid number within range
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
        setRating(numValue);
      } else if (value === "") {
        setRating(0);
      }
    }
  };

  const handleInputBlur = () => {
    // On blur, format the value
    if (inputValue === "" || inputValue === ".") {
      setInputValue("");
      setRating(0);
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, 0), 10);
        const roundedValue = Math.round(clampedValue * 10) / 10;
        setRating(roundedValue);
        setInputValue(roundedValue.toString());
      }
    }
  };

  // Sync input value when rating changes from slider
  React.useEffect(() => {
    if (rating === 0 && inputValue !== "") {
      setInputValue("");
    } else if (rating > 0 && parseFloat(inputValue) !== rating) {
      setInputValue(rating.toString());
    }
  }, [rating]);

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-2">
        <SliderPrimitive.Root
          value={[rating]}
          onValueChange={(value) => setRating(value[0])}
          min={0}
          max={10}
          step={0.1}
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className={`absolute h-full ${getRatingColor(rating)}`} />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block cursor-pointer select-none touch-none">
            <span className="text-lg">🥛</span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
        <Badge variant={getScoreBadgeVariant(rating)}>
          {formatScore(rating)}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Or enter score:
        </label>
        <Input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="0.0 - 10.0"
          className="w-24 text-center font-semibold text-[#f59e0b] border-[#f59e0b] focus:border-[#f59e0b] focus:ring-[#f59e0b]"
        />
      </div>
    </div>
  );
};
