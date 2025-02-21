
import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
}

export const PriceInput = ({ price, setPrice }: PriceInputProps) => {
  const handlePriceChange = (value: number[]) => {
    setPrice(value[0].toFixed(2));
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <SliderPrimitive.Root
          value={[parseFloat(price) || 0]}
          onValueChange={handlePriceChange}
          min={0}
          max={10}
          step={0.1}
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-cream-300" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block cursor-pointer select-none touch-none">
            <span className="text-lg">€</span>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
        <span className="min-w-[4ch] text-right flex items-center justify-center bg-cream-300 rounded-full h-8 w-8 font-semibold">
          {parseFloat(price || "0").toFixed(2)}
        </span>
      </div>
    </div>
  );
};
