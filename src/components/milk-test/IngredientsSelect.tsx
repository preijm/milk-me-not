
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface IngredientsSelectProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  allIngredients: string[];
  setAllIngredients: (ingredients: string[]) => void;
  newIngredient: string;
  setNewIngredient: (ingredient: string) => void;
}

export const IngredientsSelect = ({
  ingredients,
  setIngredients,
  allIngredients,
  setAllIngredients,
  newIngredient,
  setNewIngredient,
}: IngredientsSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleAddIngredient = () => {
    if (newIngredient && !allIngredients.includes(newIngredient)) {
      const updatedAllIngredients = [...allIngredients, newIngredient];
      setAllIngredients(updatedAllIngredients);
    }
    if (newIngredient && !ingredients.includes(newIngredient)) {
      const updatedIngredients = [...ingredients, newIngredient];
      setIngredients(updatedIngredients);
    }
    setNewIngredient("");
    setOpen(false);
  };

  const toggleIngredient = (ingredient: string) => {
    const updatedIngredients = ingredients.includes(ingredient)
      ? ingredients.filter(i => i !== ingredient)
      : [...ingredients, ingredient];
    setIngredients(updatedIngredients);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ingredients</label>
      <div className="flex flex-wrap gap-2 items-center">
        {allIngredients.map((ingredient) => (
          <div
            key={ingredient}
            className={cn(
              "px-3 py-1 rounded-full cursor-pointer text-sm transition-colors",
              ingredients.includes(ingredient)
                ? "bg-cream-300 text-gray-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => toggleIngredient(ingredient)}
          >
            {ingredient}
          </div>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add new ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddIngredient();
                  } else if (e.key === 'Escape') {
                    setOpen(false);
                    setNewIngredient("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddIngredient}
                disabled={!newIngredient}
              >
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
