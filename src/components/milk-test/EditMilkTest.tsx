
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShopSelect } from "./ShopSelect";
import { RatingSelect } from "./RatingSelect";
import { PictureCapture } from "./PictureCapture";
import { Separator } from "@/components/ui/separator";
import { BaristaToggle } from "./BaristaToggle";
import { PriceInput } from "./PriceInput";
import { ResponsiveNotesArea } from "./ResponsiveNotesArea";
import { DrinkPreference } from "./DrinkPreference";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface EditMilkTestProps {
  test: {
    id: string;
    brand: string;
    brand_id: string;
    product_name?: string;
    product_id: string;
    shop?: string;
    shop_name?: string;
    is_barista?: boolean;
    rating: number;
    notes?: string;
    product_type_keys?: string[];
    picture_path?: string;
    price_quality_ratio?: string;
    drink_preference?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMilkTest = ({ test, open, onOpenChange, onSuccess }: EditMilkTestProps) => {
  const [rating, setRating] = useState(test.rating);
  const [notes, setNotes] = useState(test.notes || "");
  const [shop, setShop] = useState(test.shop_name || "");
  const [isBarista, setIsBarista] = useState(test.is_barista || false);
  const [priceQualityRatio, setPriceQualityRatio] = useState(test.price_quality_ratio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [priceHasChanged, setPriceHasChanged] = useState(test.price_quality_ratio !== undefined && test.price_quality_ratio !== null);
  const [drinkPreference, setDrinkPreference] = useState(test.drink_preference || "cold");

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
    
    if (!test.product_id || !rating) {
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

      // Create the base update data
      const updateData: any = {
        shop_id: shopData?.id || null,
        rating,
        notes,
        picture_path: picturePath,
        drink_preference: drinkPreference
      };

      // Only include price if the user has interacted with the slider
      if (priceHasChanged) {
        updateData.price_quality_ratio = priceQualityRatio || null;
      }

      const { error: milkTestError } = await supabase
        .from('milk_tests')
        .update(updateData)
        .eq('id', test.id);

      if (milkTestError) throw milkTestError;

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
          <DialogDescription>
            Make changes to your milk test record
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product information section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="font-medium">{test.brand}</p>
              <p className="text-sm text-gray-500">{test.product_name}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Rating</h2>
            <RatingSelect 
              rating={rating} 
              setRating={setRating} 
            />
            <ResponsiveNotesArea
              notes={notes}
              setNotes={setNotes}
              picture={picture}
              picturePreview={picturePreview}
              setPicture={setPicture}
              setPicturePreview={setPicturePreview}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Price-to-Quality Ratio</h2>
            <PriceInput 
              price={priceQualityRatio} 
              setPrice={setPriceQualityRatio}
              hasChanged={priceHasChanged}
              setHasChanged={setPriceHasChanged}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Buying Information</h2>
            <ShopSelect
              shop={shop}
              setShop={setShop}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Drinking Style</h2>
            <DrinkPreference
              preference={drinkPreference}
              setPreference={setDrinkPreference}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
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
