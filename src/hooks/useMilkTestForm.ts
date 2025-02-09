
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useMilkTestForm = () => {
  const [rating, setRating] = useState(0);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState("");
  const [isBarista, setIsBarista] = useState(false);
  const [isUnsweetened, setIsUnsweetened] = useState(false);
  const [isSpecialEdition, setIsSpecialEdition] = useState(false);
  const [shop, setShop] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);
  const [drinkPreference, setDrinkPreference] = useState("cold");

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !rating) {
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
        .select('country_code')
        .eq('name', shop)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('milk_tests')
        .insert({
          brand,
          product_name: productName,
          ingredients,
          country: shopData?.country_code || null,
          shop,
          is_barista: isBarista,
          is_unsweetened: isUnsweetened,
          is_special_edition: isSpecialEdition,
          rating,
          notes,
          drink_preference: drinkPreference,
          user_id: userData.user.id,
          username: profileData?.username || null
        });

      if (error) throw error;

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
      brand,
      productName,
      ingredients,
      newIngredient,
      notes,
      isBarista,
      isUnsweetened,
      isSpecialEdition,
      shop,
      isSubmitting,
      allIngredients,
      drinkPreference,
    },
    formSetters: {
      setRating,
      setBrand,
      setProductName,
      setIngredients,
      setNewIngredient,
      setNotes,
      setIsBarista,
      setIsUnsweetened,
      setIsSpecialEdition,
      setShop,
      setAllIngredients,
      setDrinkPreference,
    },
    handleSubmit,
  };
};
