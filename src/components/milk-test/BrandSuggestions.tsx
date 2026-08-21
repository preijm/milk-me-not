
import React from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Brand } from "@/hooks/useBrandData";
import { SUGGESTION_PANEL, SUGGESTION_ROW, SUGGESTION_ROW_HINT, SUGGESTION_ROW_MUTED } from "./suggestionStyles";

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
    <div className={SUGGESTION_PANEL}>
      {closeMatch && (
        <div
          className={SUGGESTION_ROW_HINT}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelectBrand(closeMatch);
          }}
        >
          <ArrowRight className="h-4 w-4 shrink-0" />
          <span>Did you mean <strong>"{closeMatch.name}"</strong>?</span>
        </div>
      )}
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={SUGGESTION_ROW}
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
          className={SUGGESTION_ROW_MUTED}
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
