
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandSelect } from "./BrandSelect";
import { CountrySelect } from "./CountrySelect";
import { IngredientsSelect } from "./IngredientsSelect";
import { RatingSelect } from "./RatingSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditMilkTestProps {
  test: {
    id: string;
    brand: string;
    product_name?: string;
    ingredients?: string[];
    country?: string;
    is_barista?: boolean;
    rating: number;
    notes?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMilkTest = ({ test, open, onOpenChange, onSuccess }: EditMilkTestProps) => {
  const [rating, setRating] = useState(test.rating);
  const [brand, setBrand] = useState(test.brand);
  const [productName, setProductName] = useState(test.product_name || "");
  const [ingredients, setIngredients] = useState<string[]>(test.ingredients || []);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState(test.notes || "");
  const [isBarista, setIsBarista] = useState(test.is_barista || false);
  const [country, setCountry] = useState<string | null>(test.country || null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !rating) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('milk_tests')
        .update({
          brand,
          product_name: productName,
          ingredients,
          country,
          is_barista: isBarista,
          rating,
          notes,
        })
        .eq('id', test.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your milk taste test has been updated.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating milk test:', error);
      toast({
        title: "Error",
        description: "Failed to update milk test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Milk Test</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <BrandSelect
            brand={brand}
            setBrand={setBrand}
          />

          <div>
            <Input
              placeholder="Product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full"
            />
          </div>

          <IngredientsSelect
            ingredients={ingredients}
            setIngredients={setIngredients}
            allIngredients={allIngredients}
            setAllIngredients={setAllIngredients}
            newIngredient={newIngredient}
            setNewIngredient={setNewIngredient}
          />

          <CountrySelect
            country={country}
            setCountry={setCountry}
            countryOpen={countryOpen}
            setCountryOpen={setCountryOpen}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="barista"
              checked={isBarista}
              onCheckedChange={(checked) => setIsBarista(checked as boolean)}
            />
            <label
              htmlFor="barista"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Barista Version
            </label>
          </div>

          <RatingSelect rating={rating} setRating={setRating} />

          <div>
            <Textarea
              placeholder="Tasting notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-cream-300 hover:bg-cream-200 text-milk-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
