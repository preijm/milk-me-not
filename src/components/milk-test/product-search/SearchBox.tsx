import React, { KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBoxProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onClear: () => void;
  onFocus: () => void;
  hasSelectedProduct: boolean;
}
export const SearchBox = ({
  searchTerm,
  onSearchChange,
  onAddNew,
  onClear,
  onFocus,
  hasSelectedProduct
}: SearchBoxProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // If the user presses backspace when there's a selected product, 
    // immediately clear the selection
    if (e.key === 'Backspace' && hasSelectedProduct) {
      // Clear the product selection
      onClear();

      // Don't prevent default - allow the backspace to also remove a character
      // This gives a smoother experience as the selection clears and the backspace works
    }
  };
  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search for product..." 
          value={searchTerm} 
          onChange={handleInputChange} 
          onKeyDown={handleKeyDown} 
          onFocus={!hasSelectedProduct ? onFocus : undefined} 
          className="text-left placeholder:text-left pr-10" 
        />
        {searchTerm && (
          <button 
            onClick={onClear} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" 
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <Button 
        type="button" 
        onClick={onAddNew} 
        variant="outline" 
        size="icon"
        className="shrink-0"
        aria-label="Add new product"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};