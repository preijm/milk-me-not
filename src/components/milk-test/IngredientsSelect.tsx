
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { IngredientTags } from "./ingredients/IngredientTags";
import { AddIngredientForm } from "./ingredients/AddIngredientForm";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchIngredients();

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
        <IngredientTags
          ingredients={ingredients}
          allIngredients={allIngredients}
          onToggle={toggleIngredient}
        />
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
          <PopoverContent 
            className="p-0 w-[90vw] sm:w-64" 
            align="start"
            side="bottom"
            sideOffset={8}
            style={isMobile ? {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90vw',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              zIndex: 9999,
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
            } : undefined}
          >
            <div className="p-4">
              <AddIngredientForm
                value={newIngredient}
                onChange={setNewIngredient}
                onAdd={handleAddIngredient}
                onClose={() => {
                  setOpen(false);
                  setNewIngredient("");
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
