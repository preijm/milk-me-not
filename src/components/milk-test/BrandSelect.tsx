
import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBrandData, Brand } from "@/hooks/useBrandData";
import { BrandSuggestions } from "./BrandSuggestions";

interface BrandSelectProps {
  brandId: string;
  setBrandId: (id: string) => void;
  defaultBrand?: string;
  className?: string;
  onInputReady?: (input: HTMLInputElement | null) => void;
  autoFocus?: boolean;
}

export const BrandSelect = forwardRef<HTMLInputElement, BrandSelectProps>(({ 
  brandId, 
  setBrandId, 
  defaultBrand, 
  className,
  onInputReady,
  autoFocus = true
}, ref) => {
  const [inputValue, setInputValue] = useState(defaultBrand || "");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  const {
    brands,
    suggestions,
    showAddNew,
    closeMatch,
    isLoading,
    addNewBrand
  } = useBrandData(inputValue, brandId, setBrandId);

  // Update the input value when brands or brandId changes
  useEffect(() => {
    if (brandId && brands) {
      const selectedBrand = brands.find(brand => brand.id === brandId);
      if (selectedBrand) {
        setInputValue(selectedBrand.name);
      }
    } else if (brandId === '' && inputValue !== '') {
      setInputValue("");
    }
  }, [brandId, brands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectBrand = (selectedBrand: Brand) => {
    setInputValue(selectedBrand.name);
    setBrandId(selectedBrand.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewBrand = async () => {
    const newBrand = await addNewBrand(inputValue);
    if (newBrand) {
      setBrandId(newBrand.id);
      setIsDropdownVisible(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={(el) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
          onInputReady?.(el);
        }}
        placeholder="Enter brand name..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownVisible(true)}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Spacebar') {
            e.stopPropagation();
          }
        }}
        className="w-full pr-10"
        disabled={isLoading}
        autoFocus={autoFocus}
      />
      <BrandSuggestions
        suggestions={suggestions}
        showAddNew={showAddNew}
        closeMatch={closeMatch}
        inputValue={inputValue}
        onSelectBrand={handleSelectBrand}
        onAddNewBrand={handleAddNewBrand}
        isVisible={isDropdownVisible}
      />
    </div>
  );
});

BrandSelect.displayName = "BrandSelect";
