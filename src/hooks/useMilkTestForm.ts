
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/lib/fileValidation";
import { useUserProfile } from "./useUserProfile";
import { validateMilkTestInput, sanitizeInput, sanitizeForDatabase } from "@/lib/security";
import { MilkTestResult } from "@/types/milk-test";
import { useAuth } from "@/contexts/AuthContext";
import { RATING_FACTS_KEY } from "./useRatingFacts";
import { MY_RATING_KEY } from "./useMyRatingForProduct";

/**
 * Every cached view a rating can appear in.
 *
 * The board, the feed and "my ratings" were invalidated; the three queries
 * behind a product page were not. That went unnoticed while saving always
 * redirected to /feed — but the quick-rate sheet leaves you standing on the
 * product page, where a stale "1 person has rated this" is the first thing
 * you see after rating it yourself.
 */
const invalidateRatingViews = async (queryClient: QueryClient) => {
  await Promise.all(
    [
      ['milk-tests-aggregated'],
      ['my-milk-tests'],
      ['feed'],
      ['product-details'],
      ['milk-tests-details'],
      ['product-test-count'],
      RATING_FACTS_KEY,
      [MY_RATING_KEY],
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
};

type MilkTestFormOptions = {
  /**
   * Called instead of navigating to /feed once a rating is saved. The full-page
   * form wants the redirect; the quick-rate sheet wants to stay exactly where
   * the reader already was, which is the entire point of it.
   */
  onSaved?: () => void;
  /** Same, for the delete path. */
  onDeleted?: () => void;
};

export const useMilkTestForm = (editTest?: MilkTestResult, options?: MilkTestFormOptions) => {
  const [testId] = useState<string | undefined>(editTest?.id);
  const [rating, setRating] = useState(editTest?.rating || 0);
  const [productId, setProductId] = useState(editTest?.product_id || "");
  const [brandId, setBrandId] = useState(editTest?.brand_id || "");
  const [notes, setNotes] = useState(editTest?.notes || "");
  const [shop, setShop] = useState<string>(editTest?.shop_name || "");
  const [country, setCountry] = useState<string>(editTest?.country_code || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const milkTestData: {
        product_id: string;
        country_code: string | null;
        shop_name: string | null;
        rating: number;
        notes: string | null;
        drink_preference: string;
        user_id: string;
        picture_path: string | null;
        price_quality_ratio?: string;
      } = {
        product_id: productId,
        country_code: sanitizeInput(country),
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
      await invalidateRatingViews(queryClient);

      if (options?.onSaved) {
        options.onSaved();
      } else {
        navigate("/feed");
      }
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

    setIsDeleting(true);

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
        setIsDeleting(false);
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
      await invalidateRatingViews(queryClient);

      if (options?.onDeleted) {
        options.onDeleted();
      } else {
        navigate("/feed");
      }
    } catch (error) {
      console.error('Error deleting milk test:', error);
      toast({
        title: "Error",
        description: "Failed to delete milk test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      isDeleting,
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
