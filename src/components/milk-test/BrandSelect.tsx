
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

  /**
   * Show a brand the scan read but the board does not have yet.
   *
   * It arrives after mount — the lookup that decides the board has no such
   * brand is a round trip — so it cannot be an initial state value. Putting the
   * text here rather than leaving the field empty means the suggestion list
   * below is already offering to add it, which is one tap instead of retyping
   * a name the reader can see on the carton in their hand.
   */
  useEffect(() => {
    if (defaultBrand) setInputValue(defaultBrand);
  }, [defaultBrand]);

  // Update the input value when brands or brandId changes
  useEffect(() => {
    if (brandId && brands) {
      const selectedBrand = brands.find(brand => brand.id === brandId);
      if (selectedBrand) {
        setInputValue(selectedBrand.name);
      }
    } else if (brandId === '' && inputValue !== '' && !defaultBrand) {
      // Not when a scanned brand is sitting there unmatched: this fires again
      // when the brand list resolves, and it would wipe the very text the scan
      // just put in front of the reader.
      setInputValue("");
    }
  // inputValue intentionally omitted — including it causes an infinite set loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, brands, defaultBrand]);

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
