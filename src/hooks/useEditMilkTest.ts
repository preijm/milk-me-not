
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction, ToastActionElement } from "@/components/ui/toast";
import { MilkTestResult } from "@/types/milk-test";
import { sanitizeFileName } from "@/lib/fileValidation";
import { validateMilkTestInput, sanitizeInput } from "@/lib/security";

interface UseEditMilkTestProps {
  test: MilkTestResult;
  onSuccess: () => void;
  onClose: () => void;
}

export const useEditMilkTest = ({ test, onSuccess, onClose }: UseEditMilkTestProps) => {
  const [rating, setRating] = useState(test.rating);
  const [notes, setNotes] = useState(test.notes || "");
  const [shop, setShop] = useState(test.shop_name || "");
  const [country, setCountry] = useState(test.country_code || "");
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
          console.log('Loading picture from path:', test.picture_path);
          
          // First check if the file exists
          const { data: fileData, error: fileError } = await supabase.storage
            .from('milk-pictures')
            .list(test.picture_path.split('/').slice(0, -1).join('/') || '', {
              search: test.picture_path.split('/').pop()
            });
            
          if (fileError) {
            console.error('Error checking file existence:', fileError);
            return;
          }
          
          if (!fileData || fileData.length === 0) {
            console.log('File not found in storage:', test.picture_path);
            return;
          }
          
          const { data } = supabase.storage
            .from('milk-pictures')
            .getPublicUrl(test.picture_path);
            
          if (data) {
            console.log('Setting picture preview URL:', data.publicUrl);
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
    
    if (!test.product_id || !rating || !country || country.trim() === '') {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (rating and country)",
        variant: "destructive",
      });
      return;
    }

    // Validate input data
    const validation = validateMilkTestInput({
      rating: Number(rating),
      notes: notes,
      shopName: shop
    });

    if (!validation.isValid) {
      toast({
        title: "Invalid input",
        description: validation.message,
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

      // Create the base update data with sanitized inputs
      const updateData: {
        shop_name: string | null;
        country_code: string | null;
        rating: number;
        notes: string | null;
        picture_path: string | null;
        drink_preference: string;
        price_quality_ratio?: string | null;
      } = {
        shop_name: shop ? sanitizeInput(shop) : null,
        country_code: country,
        rating: Number(rating),
        notes: notes ? sanitizeInput(notes) : null,
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

      // Verify user owns this test before deletion
      if (test.user_id !== userData.user.id) {
        toast({
          title: "Unauthorized",
          description: "You can only delete your own milk tests",
          variant: "destructive",
        });
        return;
      }

      // Store the test data for potential undo
      const deletedTestData = {
        product_id: test.product_id,
        rating: test.rating,
        notes: test.notes,
        shop_name: test.shop_name,
        country_code: test.country_code,
        price_quality_ratio: test.price_quality_ratio,
        drink_preference: test.drink_preference,
        picture_path: test.picture_path,
        user_id: test.user_id,
      };

      // Delete the milk test record (keep picture for potential restore)
      const { error: deleteError } = await supabase
        .from('milk_tests')
        .delete()
        .eq('id', test.id)
        .eq('user_id', userData.user.id);

      if (deleteError) throw deleteError;

      // Create restore function
      const restoreTest = async () => {
        try {
          const { error: restoreError } = await supabase
            .from('milk_tests')
            .insert(deletedTestData);

          if (restoreError) throw restoreError;

          toast({
            title: "Restored",
            description: "Your milk test has been restored.",
          });
          onSuccess();
        } catch (error) {
          console.error('Error restoring milk test:', error);
          toast({
            title: "Error",
            description: "Failed to restore the milk test.",
            variant: "destructive",
          });
        }
      };

      // Show toast with undo option
      toast({
        title: "Test deleted",
        description: "Your milk test record has been deleted.",
        action: React.createElement(
          ToastAction,
          {
            altText: "Undo delete",
            onClick: restoreTest,
          },
          "Undo"
        ) as unknown as ToastActionElement,
        duration: 8000,
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
      country,
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
      setCountry,
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
