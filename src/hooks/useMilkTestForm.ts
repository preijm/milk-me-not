
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [shop, setShop] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
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
      ingredients,
      selectedProductTypes,
      drinkPreference,
      price
    });
    
    if (!brandId) {
      toast({
        title: "Missing fields",
        description: "Please select a brand",
        variant: "destructive",
      });
      return;
    }
    
    if (!productId) {
      toast({
        title: "Missing fields",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Missing fields",
        description: "Please provide a rating",
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
          ingredients,
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

      // Insert product type relationships
      if (selectedProductTypes.length > 0) {
        console.log("Inserting product types:", selectedProductTypes);
        
        const { data: productTypes } = await supabase
          .from('product_types')
          .select('id, key')
          .in('key', selectedProductTypes);

        console.log("Retrieved product types:", productTypes);

        if (productTypes && productTypes.length > 0) {
          const productTypeLinks = productTypes.map(pt => ({
            milk_test_id: milkTest.id,
            product_type_id: pt.id
          }));

          console.log("Inserting product type links:", productTypeLinks);

          const { error: linkError } = await supabase
            .from('milk_test_product_types')
            .insert(productTypeLinks);

          if (linkError) {
            console.error('Error inserting product type links:', linkError);
            throw linkError;
          }
        }
      }

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
      ingredients,
      newIngredient,
      notes,
      selectedProductTypes,
      shop,
      isSubmitting,
      allIngredients,
      drinkPreference,
      price,
      picture,
      picturePreview,
    },
    formSetters: {
      setRating,
      setBrandId,
      setProductId,
      setIngredients,
      setNewIngredient,
      setNotes,
      setSelectedProductTypes,
      setShop,
      setAllIngredients,
      setDrinkPreference,
      setPrice,
      setPicture,
      setPicturePreview,
    },
    handleSubmit,
  };
};
