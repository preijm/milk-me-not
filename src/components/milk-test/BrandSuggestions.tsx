
import React from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Brand } from "@/hooks/useBrandData";

interface BrandSuggestionsProps {
  suggestions: Brand[];
  showAddNew: boolean;
  closeMatch: Brand | null;
  inputValue: string;
  onSelectBrand: (brand: Brand) => void;
  onAddNewBrand: () => void;
  isVisible: boolean;
}

export const BrandSuggestions = ({
  suggestions,
  showAddNew,
  closeMatch,
  inputValue,
  onSelectBrand,
  onAddNewBrand,
  isVisible
}: BrandSuggestionsProps) => {
  if (!isVisible || (suggestions.length === 0 && !showAddNew && !closeMatch)) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
      {closeMatch && (
        <div
          className="px-4 py-2 cursor-pointer bg-accent/30 hover:bg-accent/50 flex items-center gap-2 text-sm border-b"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelectBrand(closeMatch);
          }}
        >
          <ArrowRight className="w-4 h-4 text-primary" />
          <span>Did you mean <strong>"{closeMatch.name}"</strong>?</span>
        </div>
      )}
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="px-4 py-2 cursor-pointer hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelectBrand(suggestion);
          }}
        >
          {suggestion.name}
        </div>
      ))}
      {showAddNew && (
        <div
          className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center text-muted-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            onAddNewBrand();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add "{inputValue.trim()}"
        </div>
      )}
    </div>
  );
};
