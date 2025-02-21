import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Input } from "@/components/ui/input";
import { CircleDollarSign } from "lucide-react";
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
}

export const PriceInput = ({
  price,
  setPrice
}: PriceInputProps) => {
  const [currency, setCurrency] = React.useState("€");

  const {
    data: currencies = []
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('currencies').select('symbol, code, name').order('code');
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
      if (isNaN(numericValue) || numericValue <= 5) {
        setPrice(value);
      }
    }
  };

  const selectedCurrency = currencies.find(curr => curr.symbol === currency);

  return <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <SliderPrimitive.Root value={[parseFloat(price) || 0]} onValueChange={handlePriceChange} min={0} max={5} step={0.01} className="relative flex w-full touch-none select-none items-center">
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-cream-300" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block cursor-pointer select-none touch-none">
            <CircleDollarSign className="h-5 w-5" />
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
              {currencies.map(curr => <SelectItem key={curr.code} value={curr.symbol}>
                  <span className="inline-flex items-center gap-2">
                    {curr.symbol}
                    <span className="text-muted-foreground text-sm">
                      {curr.code}
                    </span>
                  </span>
                </SelectItem>)}
            </SelectContent>
          </Select>
          <Input 
            type="text" 
            value={price} 
            onChange={handleInputChange} 
            className="w-16 text-right" 
          />
        </div>
      </div>
    </div>;
};
