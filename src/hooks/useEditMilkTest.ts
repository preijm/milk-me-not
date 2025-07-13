
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MilkTestResult } from "@/types/milk-test";
import { sanitizeFileName } from "@/lib/fileValidation";

interface UseEditMilkTestProps {
  test: MilkTestResult;
  onSuccess: () => void;
  onClose: () => void;
}

export const useEditMilkTest = ({ test, onSuccess, onClose }: UseEditMilkTestProps) => {
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

  // Load existing picture
  useEffect(() => {
    const loadExistingPicture = async () => {
      if (test.picture_path) {
        try {
          const { data } = await supabase.storage
            .from('Milk Product Pictures')
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
        const sanitizedName = sanitizeFileName(picture.name.replace(/\.[^/.]+$/, ""));
        const filePath = `${userData.user.id}/${Date.now()}_${sanitizedName}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('Milk Product Pictures')
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
      onClose();
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

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to delete milk tests",
          variant: "destructive",
        });
        return;
      }

      // Delete the picture from storage if it exists
      if (test.picture_path) {
        await supabase.storage
          .from('Milk Product Pictures')
          .remove([test.picture_path]);
      }

      // Delete the milk test record
      const { error: deleteError } = await supabase
        .from('milk_tests')
        .delete()
        .eq('id', test.id)
        .eq('user_id', userData.user.id); // Extra security check

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Your milk test record has been deleted.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting milk test:', error);
      toast({
        title: "Error",
        description: "Failed to delete milk test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      rating,
      notes,
      shop,
      isBarista,
      priceQualityRatio,
      isSubmitting,
      picture,
      picturePreview,
      priceHasChanged,
      drinkPreference
    },
    formSetters: {
      setRating,
      setNotes,
      setShop,
      setIsBarista,
      setPriceQualityRatio,
      setPicture,
      setPicturePreview,
      setPriceHasChanged,
      setDrinkPreference
    },
    handleSubmit,
    handleDelete
  };
};
