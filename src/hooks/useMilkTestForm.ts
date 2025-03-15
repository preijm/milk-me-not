
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [notes, setNotes] = useState("");
  const [shop, setShop] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drinkPreference, setDrinkPreference] = useState("cold");
  const [price, setPrice] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logging to help identify issues
    console.log("Form submission values:", {
      brandId, 
      productId, 
      rating,
      notes,
      shop,
      drinkPreference,
      price
    });
    
    // Create list of missing fields
    const missingFields = [];
    
    if (!brandId) {
      missingFields.push("brand");
    }
    
    if (!productId) {
      missingFields.push("product");
    }
    
    if (rating === 0) {
      missingFields.push("rating");
    }
    
    // Show toast with appropriate message if fields are missing
    if (missingFields.length > 0) {
      let description = "";
      
      if (missingFields.length === 1) {
        description = `Please provide: ${missingFields[0]}`;
      } else {
        const lastField = missingFields.pop();
        description = `Please provide: ${missingFields.join(", ")} and ${lastField}`;
      }
      
      toast({
        title: "Missing fields",
        description: description,
        variant: "destructive",
      });
      return;
    }

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

      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userData.user.id)
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
      
      // Insert the milk test
      const { data: milkTest, error: milkTestError } = await supabase
        .from('milk_tests')
        .insert({
          brand_id: brandId,
          product_id: productId,
          shop_id: shopData?.id || null,
          rating,
          notes,
          drink_preference: drinkPreference,
          user_id: userData.user.id,
          display_name: profileData?.display_name || null,
          price: price ? parseFloat(price) : null,
          picture_path: picturePath
        })
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
      setPicture,
      setPicturePreview,
    },
    handleSubmit,
  };
};
