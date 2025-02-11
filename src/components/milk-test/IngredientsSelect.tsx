
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchIngredients();

    // Set up realtime subscription
    const channel = supabase
      .channel('ingredients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingredients'
        },
        () => {
          fetchIngredients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('name')
        .order('ordering', { ascending: true })
        .order('name');
      
      if (error) throw error;
      
      const ingredientNames = data.map(ing => ing.name);
      setAllIngredients(ingredientNames);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: "Error",
        description: "Failed to load ingredients",
        variant: "destructive",
      });
    }
  };

  const handleAddIngredient = async () => {
    if (!newIngredient) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .insert({ name: newIngredient });

      if (error) throw error;

      const updatedAllIngredients = [...allIngredients, newIngredient];
      setAllIngredients(updatedAllIngredients);
      
      if (!ingredients.includes(newIngredient)) {
        const updatedIngredients = [...ingredients, newIngredient];
        setIngredients(updatedIngredients);
      }

      setNewIngredient("");
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Ingredient added successfully",
      });
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to add ingredient",
        variant: "destructive",
      });
    }
  };

  const toggleIngredient = (ingredient: string) => {
    const updatedIngredients = ingredients.includes(ingredient)
      ? ingredients.filter(i => i !== ingredient)
      : [...ingredients, ingredient];
    setIngredients(updatedIngredients);
  };

  return (
    <div className="space-y-2">
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
              className="p-1 h-auto rounded-full hover:bg-cream-200"
            >
              <Plus className="h-4 w-4 text-cream-700" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="center">
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
                className="bg-cream-300 hover:bg-cream-200 text-gray-800"
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
