
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [productId, setProductId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [notes, setNotes] = useState("");
  const [shop, setShop] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drinkPreference, setDrinkPreference] = useState("cold");
  const [price, setPrice] = useState(""); // Empty string for no default selection
  const [priceHasChanged, setPriceHasChanged] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logging to help identify issues
    console.log("Milk Test Form submission values:", {
      brandId,
      productId, 
      rating,
      notes,
      shop,
      drinkPreference,
      price, // Log the actual price value
      priceHasChanged // Log whether price has changed
    });
    
    // Validation moved to the component itself
    // This prevents toast notifications from appearing when not needed
    
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

      // Get shop data if provided
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('name', shop)
        .maybeSingle();

      // Upload picture if available
      let picturePath = null;
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
            description: "Failed to upload the picture. Your test will be saved without the image.",
            variant: "destructive",
          });
        } else {
          picturePath = filePath;
        }
      }

      console.log("Inserting milk test with user_id:", userData.user.id);
      
      // Base milk test data
      const milkTestData: any = {
        product_id: productId,
        shop_id: shopData?.id || null,
        rating,
        notes,
        drink_preference: drinkPreference,
        user_id: userData.user.id,
        picture_path: picturePath
      };
      
      // Only add price_quality_ratio if the user actually changed it and selected a value
      if (priceHasChanged && price) {
        console.log("Adding price_quality_ratio:", parseFloat(price));
        milkTestData.price_quality_ratio = parseFloat(price);
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

      navigate("/dashboard");
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
      setDrinkPreference,
      setPrice,
      setPriceHasChanged,
      setPicture,
      setPicturePreview,
    },
    handleSubmit,
  };
};
