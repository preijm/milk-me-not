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
        {/* z-10 because the input's own background is opaque and paints after
            this in tree order — the magnifier was rendered but invisible. */}
        <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-story-muted-2" />
        <Input 
          placeholder="Search for product..." 
          value={searchTerm} 
          onChange={handleInputChange} 
          onKeyDown={handleKeyDown} 
          onFocus={!hasSelectedProduct ? onFocus : undefined} 
          className="pl-11 pr-10" 
        />
        {searchTerm && (
          <button 
            onClick={onClear} 
            className="absolute right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-story-muted-2 transition-colors hover:bg-story-ink/6 hover:text-story-ink" 
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
        className="h-12 w-12 shrink-0 rounded-xl border-[1.5px] border-story-ink/12"
        aria-label="Add new product"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};