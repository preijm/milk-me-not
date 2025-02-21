
import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Input } from "@/components/ui/input";
import { Coins } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
}

const currencies = [
  { symbol: "€", name: "EUR" },
  { symbol: "$", name: "USD" },
  { symbol: "£", name: "GBP" },
  { symbol: "¥", name: "JPY" },
];

export const PriceInput = ({ price, setPrice }: PriceInputProps) => {
  const [currency, setCurrency] = React.useState("€");

  const handlePriceChange = (value: number[]) => {
    setPrice(value[0].toFixed(2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point with up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= 5) {
        setPrice(value);
      }
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <SliderPrimitive.Root
          value={[parseFloat(price) || 0]}
          onValueChange={handlePriceChange}
          min={0}
          max={5}
          step={0.01}
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-cream-300" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block cursor-pointer select-none touch-none">
            <Coins className="h-5 w-5" />
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
        <div className="flex items-center gap-1 min-w-[120px]">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[40px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.name} value={curr.symbol}>
                  {curr.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={price}
            onChange={handleInputChange}
            className="w-12 text-right"
          />
        </div>
      </div>
    </div>
  );
};
