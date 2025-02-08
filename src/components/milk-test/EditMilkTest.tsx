
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandSelect } from "./BrandSelect";
import { CountrySelect } from "./CountrySelect";
import { ShopSelect } from "./ShopSelect";
import { IngredientsSelect } from "./IngredientsSelect";
import { RatingSelect } from "./RatingSelect";
import { Separator } from "@/components/ui/separator";
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
    shop?: string;
    is_barista?: boolean;
    is_unsweetened?: boolean;
    is_special_edition?: boolean;
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
  const [isUnsweetened, setIsUnsweetened] = useState(test.is_unsweetened || false);
  const [isSpecialEdition, setIsSpecialEdition] = useState(test.is_special_edition || false);
  const [country, setCountry] = useState<string | null>(test.country || null);
  const [shop, setShop] = useState(test.shop || "");
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
          shop,
          is_barista: isBarista,
          is_unsweetened: isUnsweetened,
          is_special_edition: isSpecialEdition,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Milk Test</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            <BrandSelect
              brand={brand}
              setBrand={setBrand}
            />
            <Input
              placeholder="Product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Buying Location</h2>
            <CountrySelect
              country={country}
              setCountry={setCountry}
            />
            <ShopSelect
              shop={shop}
              setShop={setShop}
              country={country}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Type</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="barista-edit"
                  checked={isBarista}
                  onCheckedChange={(checked) => setIsBarista(checked as boolean)}
                />
                <label
                  htmlFor="barista-edit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Barista Version
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unsweetened-edit"
                  checked={isUnsweetened}
                  onCheckedChange={(checked) => setIsUnsweetened(checked as boolean)}
                />
                <label
                  htmlFor="unsweetened-edit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Unsweetened
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="special-edit"
                  checked={isSpecialEdition}
                  onCheckedChange={(checked) => setIsSpecialEdition(checked as boolean)}
                />
                <label
                  htmlFor="special-edit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Special Edition
                </label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
            <IngredientsSelect
              ingredients={ingredients}
              setIngredients={setIngredients}
              allIngredients={allIngredients}
              setAllIngredients={setAllIngredients}
              newIngredient={newIngredient}
              setNewIngredient={setNewIngredient}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Judgment</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <RatingSelect rating={rating} setRating={setRating} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Tasting notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
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
