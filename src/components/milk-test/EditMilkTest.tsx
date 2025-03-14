import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BrandSelect } from "./BrandSelect";
import { ShopSelect } from "./ShopSelect";
import { IngredientsSelect } from "./IngredientsSelect";
import { RatingSelect } from "./RatingSelect";
import { ProductOptions } from "./ProductOptions";
import { PictureCapture } from "./PictureCapture";
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
    brand_id: string;
    product_name?: string;
    ingredients?: string[];
    country?: string;
    shop?: string;
    is_barista?: boolean;
    is_unsweetened?: boolean;
    is_special_edition?: boolean;
    is_no_sugar?: boolean;
    rating: number;
    notes?: string;
    product_type_keys?: string[];
    shop_name?: string;
    picture_path?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMilkTest = ({ test, open, onOpenChange, onSuccess }: EditMilkTestProps) => {
  const [rating, setRating] = useState(test.rating);
  const [brandId, setBrandId] = useState(test.brand_id);
  const [productName, setProductName] = useState(test.product_name || "");
  const [ingredients, setIngredients] = useState<string[]>(test.ingredients || []);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState(test.notes || "");
  const [selectedProductProperties, setSelectedProductProperties] = useState<string[]>(test.product_type_keys || []);
  const [shop, setShop] = useState(test.shop_name || "");
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const loadExistingPicture = async () => {
      if (test.picture_path) {
        try {
          const { data } = await supabase.storage
            .from('milk-pictures')
            .getPublicUrl(test.picture_path);
            
          if (data) {
            setPicturePreview(data.publicUrl);
          }
        } catch (error) {
          console.error('Error loading picture:', error);
        }
      }
    };
    
    loadExistingPicture();
  }, [test.picture_path]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandId || !rating) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to edit milk tests",
          variant: "destructive",
        });
        return;
      }
      
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('name', shop)
        .maybeSingle();

      let picturePath = test.picture_path;
      if (picture) {
        const fileExt = picture.name.split('.').pop();
        const filePath = `${userData.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('milk-pictures')
          .upload(filePath, picture);
          
        if (uploadError) {
          console.error('Error uploading picture:', uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload the picture. Your test will be saved with the existing image.",
            variant: "destructive",
          });
        } else {
          picturePath = filePath;
        }
      }

      const { error: milkTestError } = await supabase
        .from('milk_tests')
        .update({
          brand_id: brandId,
          product_name: productName,
          ingredients,
          shop_id: shopData?.id || null,
          rating,
          notes,
          picture_path: picturePath
        })
        .eq('id', test.id);

      if (milkTestError) throw milkTestError;

      const { error: deleteError } = await supabase
        .from('milk_test_product_types')
        .delete()
        .eq('milk_test_id', test.id);

      if (deleteError) throw deleteError;

      if (selectedProductProperties.length > 0) {
        const { data: productTypes } = await supabase
          .from('product_types')
          .select('id, key')
          .in('key', selectedProductProperties);

        if (productTypes) {
          const productPropertyLinks = productTypes.map(pp => ({
            milk_test_id: test.id,
            product_type_id: pp.id
          }));

          const { error: linkError } = await supabase
            .from('milk_test_product_types')
            .insert(productPropertyLinks);

          if (linkError) throw linkError;
        }
      }

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
              brandId={brandId}
              setBrandId={setBrandId}
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
            <ShopSelect
              shop={shop}
              setShop={setShop}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Properties</h2>
            <ProductOptions
              selectedTypes={selectedProductProperties}
              setSelectedTypes={setSelectedProductProperties}
            />
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
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    placeholder="Tasting notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Picture</label>
                  <PictureCapture
                    picture={picture}
                    picturePreview={picturePreview}
                    setPicture={setPicture}
                    setPicturePreview={setPicturePreview}
                  />
                </div>
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
