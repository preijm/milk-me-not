
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
    isLoading,
    addNewBrand
  } = useBrandData(inputValue, brandId, setBrandId);

  // Update the input value when brands or brandId changes
  useEffect(() => {
    if (brandId && brands) {
      console.log("BrandSelect: brandId changed to", brandId);
      const selectedBrand = brands.find(brand => brand.id === brandId);
      if (selectedBrand) {
        setInputValue(selectedBrand.name);
        console.log("BrandSelect: Setting input value to", selectedBrand.name);
      }
    } else if (brandId === '' && inputValue !== '') {
      // Clear input value when brandId is empty
      setInputValue("");
      console.log("BrandSelect: Clearing input value since brandId is empty");
    }
  }, [brandId, brands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("BrandSelect: Input changed to", newValue);
    setInputValue(newValue);
  };

  const handleSelectBrand = (selectedBrand: Brand) => {
    console.log("BrandSelect: Selected brand", selectedBrand);
    setInputValue(selectedBrand.name);
    setBrandId(selectedBrand.id);
    setIsDropdownVisible(false);
  };

  const handleAddNewBrand = async () => {
    const newBrand = await addNewBrand(inputValue);
    if (newBrand) {
      console.log("BrandSelect: New brand created, setting brandId to", newBrand.id);
      setBrandId(newBrand.id);
      setIsDropdownVisible(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={(el) => {
          // Handle forwarded ref
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
          // Notify parent when input is ready
          onInputReady?.(el);
          console.log('BrandSelect Input ref set:', el);
        }}
        placeholder="Enter brand name..."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          console.log('BrandSelect input focused');
          setIsDropdownVisible(true);
        }}
        onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)}
        onKeyDown={(e) => {
          // Ensure the spacebar works inside dialogs/popovers by stopping propagation only
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
        inputValue={inputValue}
        onSelectBrand={handleSelectBrand}
        onAddNewBrand={handleAddNewBrand}
        isVisible={isDropdownVisible}
      />
    </div>
  );
});

BrandSelect.displayName = "BrandSelect";
