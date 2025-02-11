
import React from "react";
import { cn } from "@/lib/utils";

interface IngredientTagsProps {
  ingredients: string[];
  allIngredients: string[];
  onToggle: (ingredient: string) => void;
}

export const IngredientTags = ({ ingredients, allIngredients, onToggle }: IngredientTagsProps) => {
  return (
    <>
      {allIngredients.map((ingredient) => (
        <div
          key={ingredient}
          className={cn(
            "px-3 py-1 rounded-full cursor-pointer text-sm transition-colors",
            ingredients.includes(ingredient)
              ? "bg-cream-300 text-gray-800"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          onClick={() => onToggle(ingredient)}
        >
          {ingredient}
        </div>
      ))}
    </>
  );
};
