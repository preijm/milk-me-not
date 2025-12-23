
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
  if (rating >= 8.5) return "bg-score-excellent";
  if (rating >= 7.5) return "bg-score-good"; 
  if (rating >= 5.5) return "bg-score-fair";
  return "bg-score-poor";
};

export const RatingSelect = ({ rating, setRating }: RatingSelectProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleBadgeClick = () => {
    setIsEditing(true);
    setInputValue(rating > 0 ? rating.toString() : "");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string or valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    
    if (inputValue === "" || inputValue === ".") {
      setRating(0);
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, 0), 10);
        const roundedValue = Math.round(clampedValue * 10) / 10;
        setRating(roundedValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-2 w-full">
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
        
        {isEditing ? (
          <Input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-16 h-8 text-center font-semibold text-gray-600 border-gray-300 focus:border-gray-400 focus:ring-gray-400 px-2"
          />
        ) : (
          <Badge 
            variant={getScoreBadgeVariant(rating)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleBadgeClick}
          >
            {formatScore(rating)}
          </Badge>
        )}
      </div>
    </div>
  );
};
