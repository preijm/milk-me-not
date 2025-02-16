
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [brandId, setBrandId] = useState("");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [shop, setShop] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [drinkPreference, setDrinkPreference] = useState("cold");

  const { toast } = useToast();
  const navigate = useNavigate();

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
          description: "Please sign in to add milk tests",
          variant: "destructive",
        });
        return;
      }

      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('name', shop)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .maybeSingle();

      // Insert the milk test
      const { data: milkTest, error: milkTestError } = await supabase
        .from('milk_tests')
        .insert({
          brand_id: brandId,
          product_name: productName,
          ingredients,
          shop_id: shopData?.id || null,
          rating,
          notes,
          drink_preference: drinkPreference,
          user_id: userData.user.id,
          username: profileData?.username || null
        })
        .select()
        .single();

      if (milkTestError) throw milkTestError;

      // Insert product type relationships
      if (selectedProductTypes.length > 0) {
        const { data: productTypes } = await supabase
          .from('product_types')
          .select('id, key')
          .in('key', selectedProductTypes);

        if (productTypes) {
          const productTypeLinks = productTypes.map(pt => ({
            milk_test_id: milkTest.id,
            product_type_id: pt.id
          }));

          const { error: linkError } = await supabase
            .from('milk_test_product_types')
            .insert(productTypeLinks);

          if (linkError) throw linkError;
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
      productName,
      ingredients,
      newIngredient,
      notes,
      selectedProductTypes,
      shop,
      isSubmitting,
      allIngredients,
      drinkPreference,
    },
    formSetters: {
      setRating,
      setBrandId,
      setProductName,
      setIngredients,
      setNewIngredient,
      setNotes,
      setSelectedProductTypes,
      setShop,
      setAllIngredients,
      setDrinkPreference,
    },
    handleSubmit,
  };
};
