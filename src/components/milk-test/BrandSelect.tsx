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

interface BrandSelectProps {
  brand: string;
  setBrand: (brand: string) => void;
  brands: string[];
  isLoadingBrands: boolean;
  brandOpen: boolean;
  setBrandOpen: (open: boolean) => void;
}

export const BrandSelect = ({
  brand,
  setBrand,
  brands,
  isLoadingBrands,
  brandOpen,
  setBrandOpen,
}: BrandSelectProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <Popover open={brandOpen} onOpenChange={setBrandOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={brandOpen}
            className="justify-between"
          >
            {brand || "Select brand..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search brands..." />
            <CommandEmpty>
              Type to add a new brand.
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => {
                  const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                  if (input?.value) {
                    setBrand(input.value);
                    setBrandOpen(false);
                  }
                }}
              >
                Add new brand
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {!isLoadingBrands && brands.map((existingBrand) => (
                <CommandItem
                  key={existingBrand}
                  value={existingBrand}
                  onSelect={() => {
                    setBrand(existingBrand);
                    setBrandOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      brand === existingBrand ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {existingBrand}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};