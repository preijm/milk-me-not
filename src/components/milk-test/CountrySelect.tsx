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

interface CountrySelectProps {
  country: string | null;
  setCountry: (country: string) => void;
  countryOpen: boolean;
  setCountryOpen: (open: boolean) => void;
}

export const CountrySelect = ({
  country,
  setCountry,
  countryOpen,
  setCountryOpen,
}: CountrySelectProps) => {
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('Fetching countries from database...');
      const { data, error } = await supabase
        .from('countries')
        .select('name, code')
        .order('name');
      
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
      
      console.log('Fetched countries:', data);
      return data || [];
    },
  });

  const getCountryFlag = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const selectedCountry = countries.find(c => c.code === country);

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={countryOpen}
            className="justify-between"
            disabled={isLoading}
          >
            {isLoading ? "Loading countries..." : 
              selectedCountry ? 
                `${getCountryFlag(selectedCountry.code)} ${selectedCountry.name}` 
                : "Select country (optional)"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={c.code}
                  onSelect={(value) => {
                    setCountry(value);
                    setCountryOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      country === c.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getCountryFlag(c.code)} {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};