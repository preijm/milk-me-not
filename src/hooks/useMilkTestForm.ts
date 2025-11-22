
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/lib/fileValidation";
import { useUserProfile } from "./useUserProfile";
import { validateMilkTestInput, sanitizeInput, sanitizeForDatabase } from "@/lib/security";
import { MilkTestResult } from "@/types/milk-test";
import { useAuth } from "@/contexts/AuthContext";

export const useMilkTestForm = (editTest?: MilkTestResult) => {
  const [testId, setTestId] = useState<string | undefined>(editTest?.id);
  const [rating, setRating] = useState(editTest?.rating || 0);
  const [productId, setProductId] = useState(editTest?.product_id || "");
  const [brandId, setBrandId] = useState(editTest?.brand_id || "");
  const [notes, setNotes] = useState(editTest?.notes || "");
  const [shop, setShop] = useState<string>(editTest?.shop_name || "");
  const [country, setCountry] = useState<string>(editTest?.country_code || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drinkPreference, setDrinkPreference] = useState(editTest?.drink_preference || "cold");
  const [price, setPrice] = useState(editTest?.price_quality_ratio || "");
  const [priceHasChanged, setPriceHasChanged] = useState(!!editTest?.price_quality_ratio);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();
  const { user } = useAuth();

  // Load existing picture preview when editing
  useEffect(() => {
    if (editTest?.picture_path) {
      const loadPicturePreview = async () => {
        const { data } = supabase.storage
          .from('milk-pictures')
          .getPublicUrl(editTest.picture_path);
        
        if (data?.publicUrl) {
          setPicturePreview(data.publicUrl);
        }
      };
      loadPicturePreview();
    }
  }, [editTest]);

  // Set default country when profile loads (only for new tests)
  useEffect(() => {
    if (profile?.default_country_code && !country && !editTest) {
      setCountry(profile.default_country_code);
    }
  }, [profile, country, editTest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!country || country.trim() === '') {
      toast({
        title: "Country required",
        description: "Please select a country before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate input data before submission
    const validation = validateMilkTestInput({
      rating: Number(rating),
      notes: notes,
      shopName: shop,
      countryCode: country
    });

    if (!validation.isValid) {
      toast({
        title: "Invalid input",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    // Debug logging to help identify issues
    console.log("Milk Test Form submission values:", {
      brandId,
      productId, 
      rating,
      notes,
      shop,
      country,
      drinkPreference,
      price, // Log the actual price value
      priceHasChanged, // Log whether price has changed
      hasPicture: !!picture // Log whether a picture is attached
    });
    
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add milk tests",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Authenticated user:", userData.user.id);

      // Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (!existingProfile) {
        console.log("Creating user profile...");
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            username: userData.user.email?.split('@')[0] || 'User'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            title: "Profile Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Remove shop lookup since we're storing shop_name directly now

      // Upload picture if available
      let picturePath = null;
      if (picture) {
        console.log("Uploading picture to Supabase storage...");
        const fileExt = picture.name.split('.').pop();
        const sanitizedName = sanitizeFileName(picture.name.replace(/\.[^/.]+$/, ""));
        const filePath = `${userData.user.id}/${Date.now()}_${sanitizedName}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('milk-pictures')
          .upload(filePath, picture);
          
        if (uploadError) {
          console.error('Error uploading picture:', uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload the picture. Your test will be saved without the image.",
            variant: "destructive",
          });
        } else {
          console.log("Picture uploaded successfully:", uploadData);
          picturePath = filePath;
        }
      }

      console.log(testId ? "Updating milk test..." : "Inserting milk test with user_id:", userData.user.id);
      
      // Base milk test data with sanitized inputs
      const milkTestData: any = {
        product_id: productId,
        country_code: country ? sanitizeInput(country) : null,
        shop_name: shop ? sanitizeForDatabase(shop) : null,
        rating: Number(rating),
        notes: notes ? sanitizeForDatabase(notes) : null,
        drink_preference: drinkPreference,
        user_id: userData.user.id,
        picture_path: picturePath || (editTest?.picture_path || null)
      };
      
      // Only add price_quality_ratio if the user actually changed it and selected a value
      if (priceHasChanged && price) {
        console.log("Adding price_quality_ratio:", price);
        milkTestData.price_quality_ratio = price;
      }

      let milkTest;
      let milkTestError;

      if (testId) {
        // Update existing test
        const result = await supabase
          .from('milk_tests')
          .update(milkTestData)
          .eq('id', testId)
          .select()
          .single();
        
        milkTest = result.data;
        milkTestError = result.error;
      } else {
        // Insert new test
        const result = await supabase
          .from('milk_tests')
          .insert(milkTestData)
          .select()
          .single();
        
        milkTest = result.data;
        milkTestError = result.error;
      }

      if (milkTestError) {
        console.error('Milk test error:', milkTestError);
        throw milkTestError;
      }

      console.log(testId ? "Milk test updated successfully:" : "Milk test inserted successfully:", milkTest);

      toast({
        title: testId ? "Test updated!" : "Test added!",
        description: testId ? "Your milk taste test has been updated." : "Your milk taste test has been recorded.",
      });

      // Invalidate relevant queries to refresh data on results pages
      await queryClient.invalidateQueries({ queryKey: ['milk-tests-aggregated'] });
      await queryClient.invalidateQueries({ queryKey: ['my-milk-tests'] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });

      navigate("/feed");
    } catch (error) {
      console.error('Error adding milk test:', error);
      toast({
        title: "Error",
        description: "Failed to add milk test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!testId || !user) return;

    setIsSubmitting(true);

    try {
      // Delete the picture from storage if it exists
      if (editTest?.picture_path) {
        await supabase.storage
          .from('milk-pictures')
          .remove([editTest.picture_path]);
      }

      // Verify user owns this test before deletion
      if (editTest?.user_id !== user.id) {
        toast({
          title: "Unauthorized",
          description: "You can only delete your own milk tests",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Delete the milk test record
      const { error: deleteError } = await supabase
        .from('milk_tests')
        .delete()
        .eq('id', testId)
        .eq('user_id', user.id); // Extra security check

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Your milk test record has been deleted.",
      });

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['milk-tests-aggregated'] });
      await queryClient.invalidateQueries({ queryKey: ['my-milk-tests'] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });

      navigate("/feed");
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
      brandId,
      productId,
      notes,
      shop,
      country,
      isSubmitting,
      drinkPreference,
      price,
      priceHasChanged,
      picture,
      picturePreview,
    },
    formSetters: {
      setRating,
      setBrandId,
      setProductId,
      setNotes,
      setShop,
      setCountry,
      setDrinkPreference,
      setPrice,
      setPriceHasChanged,
      setPicture,
      setPicturePreview,
    },
    handleSubmit,
    handleDelete,
  };
};
