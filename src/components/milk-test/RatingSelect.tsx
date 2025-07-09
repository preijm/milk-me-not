
import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";

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
        <Badge variant={getScoreBadgeVariant(rating)}>
          {rating.toFixed(1)}
        </Badge>
      </div>
    </div>
  );
};
