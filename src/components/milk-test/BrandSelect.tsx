import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BrandSelectProps {
  brand: string;
  setBrand: (brand: string) => void;
  brandOpen: boolean;
  setBrandOpen: (open: boolean) => void;
}

export const BrandSelect = ({
  brand,
  setBrand,
  brandOpen,
  setBrandOpen,
}: BrandSelectProps) => {
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log('Fetching brands from database...');
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .order('name');
      
      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      
      console.log('Fetched brands:', data);
      return data || [];
    },
  });

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={brandOpen}
            className="justify-between"
            disabled={isLoading}
          >
            {isLoading ? "Loading brands..." : brand || "Select brand..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search brands..." />
            <CommandEmpty>No brand found.</CommandEmpty>
            <CommandGroup>
              {brands.map((b) => (
                <CommandItem
                  key={b.name}
                  value={b.name}
                  onSelect={(value) => {
                    setBrand(value);
                    setBrandOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      brand === b.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};