
import React, { useState, useEffect } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Input } from "@/components/ui/input";
import { 
  CircleDollarSign, 
  Euro,
  PoundSterling,
  JapaneseYen
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
}

interface Currency {
  symbol: string;
  code: string;
  name: string;
  ordering: number;
  typical_max_price?: number;
}

// Currency typical price ranges - these values represent common price ranges for plant-based milk
const CURRENCY_MAX_VALUES: Record<string, number> = {
  "€": 10,     // Euro (up to 10€)
  "$": 12,     // US Dollar (up to $12)
  "£": 9,      // British Pound (up to £9)
  "¥": 1500,   // Japanese Yen (up to ¥1500)
  "₩": 15000,  // Korean Won (up to ₩15000)
  "kr": 120,   // Swedish/Danish/Norwegian Krona (up to 120kr)
  "Fr": 12,    // Swiss Franc (up to 12Fr)
  "₹": 800,    // Indian Rupee (up to ₹800)
  "C$": 15,    // Canadian Dollar (up to C$15)
  "A$": 15,    // Australian Dollar (up to A$15)
  // Default for any other currency
  "default": 20
};

export const PriceInput = ({
  price,
  setPrice
}: PriceInputProps) => {
  const [currency, setCurrency] = useState("€");
  const [maxValue, setMaxValue] = useState(CURRENCY_MAX_VALUES["€"]);
  
  // Update max value when currency changes
  useEffect(() => {
    const newMaxValue = CURRENCY_MAX_VALUES[currency] || CURRENCY_MAX_VALUES.default;
    setMaxValue(newMaxValue);
    
    // If current price exceeds new max, cap it
    const currentPrice = parseFloat(price);
    if (!isNaN(currentPrice) && currentPrice > newMaxValue) {
      setPrice(newMaxValue.toFixed(2));
    }
  }, [currency, setPrice]);

  const {
    data: currencies = []
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('ordering');
      
      if (error) {
        console.error('Error fetching currencies:', error);
        throw error;
      }
      return data as Currency[];
    }
  });

  const handlePriceChange = (value: number[]) => {
    setPrice(value[0].toFixed(2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= maxValue) {
        setPrice(value);
      }
    }
  };

  const getCurrencyIcon = (symbol: string) => {
    switch(symbol) {
      case '€':
        return <Euro className="h-5 w-5" />;
      case '£':
        return <PoundSterling className="h-5 w-5" />;
      case '¥':
        return <JapaneseYen className="h-5 w-5" />;
      default:
        return <CircleDollarSign className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <SliderPrimitive.Root 
          value={[parseFloat(price) || 0]} 
          onValueChange={handlePriceChange} 
          min={0} 
          max={maxValue} 
          step={0.01} 
          className="relative flex w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-cream-300" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block cursor-pointer select-none touch-none">
            {getCurrencyIcon(currency)}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
        <div className="flex items-center gap-1 min-w-[140px]">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[80px]">
              <SelectValue>
                {currency}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {currencies.map(curr => (
                <SelectItem key={curr.code} value={curr.symbol}>
                  <span className="inline-flex items-center gap-2">
                    {curr.symbol}
                    <span className="text-muted-foreground text-sm">
                      {curr.code}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            type="text" 
            value={price} 
            onChange={handleInputChange} 
            className="w-16 text-right" 
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-right">
        Max: {currency}{maxValue.toFixed(2)}
      </div>
    </div>
  );
};
