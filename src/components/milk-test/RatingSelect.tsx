
import React from "react";
import { Slider } from "@/components/ui/slider";

interface RatingSelectProps {
  rating: number;
  setRating: (rating: number) => void;
}

export const RatingSelect = ({ rating, setRating }: RatingSelectProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Slider
          value={[rating]}
          onValueChange={(value) => setRating(value[0])}
          min={0}
          max={10}
          step={0.1}
          className="w-full"
        />
        <span className="min-w-[4ch] text-right flex items-center gap-1">
          {rating.toFixed(1)} 🥛
        </span>
      </div>
      <div className="flex justify-between px-2 text-xs">
        {[0, 2, 4, 6, 8, 10].map((value) => (
          <span key={value} className="text-gray-500">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
};
