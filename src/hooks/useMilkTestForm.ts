
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/lib/fileValidation";
import { useUserProfile } from "./useUserProfile";
import { validateMilkTestInput, sanitizeInput, sanitizeForDatabase } from "@/lib/security";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [productId, setProductId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [notes, setNotes] = useState("");
  const [shop, setShop] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drinkPreference, setDrinkPreference] = useState("cold");
  const [price, setPrice] = useState(""); // Empty string for no default selection
  const [priceHasChanged, setPriceHasChanged] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();

  // Set default country when profile loads
  useEffect(() => {
    if (profile?.default_country_code && !country) {
      setCountry(profile.default_country_code);
    }
  }, [profile, country]);

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

      console.log("Inserting milk test with user_id:", userData.user.id);
      
      // Base milk test data with sanitized inputs
      const milkTestData: any = {
        product_id: productId,
        country_code: country ? sanitizeInput(country) : null,
        shop_name: shop ? sanitizeForDatabase(shop) : null,
        rating: Number(rating),
        notes: notes ? sanitizeForDatabase(notes) : null,
        drink_preference: drinkPreference,
        user_id: userData.user.id,
        picture_path: picturePath
      };
      
      // Only add price_quality_ratio if the user actually changed it and selected a value
      if (priceHasChanged && price) {
        console.log("Adding price_quality_ratio:", price);
        milkTestData.price_quality_ratio = price;
      }

      const { data: milkTest, error: milkTestError } = await supabase
        .from('milk_tests')
        .insert(milkTestData)
        .select()
        .single();

      if (milkTestError) {
        console.error('Milk test error:', milkTestError);
        throw milkTestError;
      }

      console.log("Milk test inserted successfully:", milkTest);

      toast({
        title: "Test added!",
        description: "Your milk taste test has been recorded.",
      });

      // Invalidate relevant queries to refresh data on results pages
      await queryClient.invalidateQueries({ queryKey: ['milk-tests-aggregated'] });
      await queryClient.invalidateQueries({ queryKey: ['my-milk-tests'] });

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
  };
};
