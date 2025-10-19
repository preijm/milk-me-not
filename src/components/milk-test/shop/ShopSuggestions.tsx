
import React from "react";
import { Plus } from "lucide-react";

interface ShopSuggestionsProps {
  suggestions: { name: string; country_code: string }[];
  showAddNew: boolean;
  inputValue: string;
  onSelect: (shop: { name: string; country_code: string }) => void;
  onAddNew: () => void;
  isVisible: boolean;
}

export const ShopSuggestions = ({
  suggestions,
  showAddNew,
  inputValue,
  onSelect,
  onAddNew,
  isVisible
}: ShopSuggestionsProps) => {
  if (!isVisible || (suggestions.length === 0 && !showAddNew)) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(suggestion);
          }}
        >
          {suggestion.name}
        </div>
      ))}
      {showAddNew && (
        <div
          className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-700"
          onMouseDown={(e) => {
            e.preventDefault();
            onAddNew();
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add "{inputValue.trim()}"
        </div>
      )}
    </div>
  );
};
