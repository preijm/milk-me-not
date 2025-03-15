
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  handleProductSubmit, 
  resetFormState 
} from "./productRegistrationUtils";

interface UseProductRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
}

export const useProductRegistrationForm = ({
  open,
  onOpenChange,
  onSuccess
}: UseProductRegistrationFormProps) => {
  // Form state
  const [brandId, setBrandId] = useState("");
  const [productName, setProductName] = useState("");
  const [nameId, setNameId] = useState<string | null>(null);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [isBarista, setIsBarista] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetFormState({
        setBrandId,
        setProductName,
        setNameId,
        setSelectedProductTypes,
        setIsBarista,
        setSelectedFlavors
      });
    }
  }, [open]);

  // Fetch product_flavors
  const { data: flavors = [] } = useQuery({
    queryKey: ['product_flavors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flavors')
        .select('id, name, key')
        .order('ordering', { ascending: true });
      
      if (error) {
        console.error('Error fetching product flavors:', error);
        throw error;
      }
      return data || [];
    }
  });
  
  const handleFlavorToggle = (flavorKey: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavorKey) 
        ? prev.filter(key => key !== flavorKey) 
        : [...prev, flavorKey]
    );
  };

  const handleBaristaToggle = (checked: boolean) => {
    setIsBarista(checked);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!brandId) {
      toast({
        title: "Missing brand",
        description: "Please select a brand for this product",
        variant: "destructive"
      });
      return;
    }
    if (!productName) {
      toast({
        title: "Missing product",
        description: "Please enter a name for this product",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await handleProductSubmit({
        brandId,
        productName,
        nameId,
        selectedProductTypes,
        isBarista,
        selectedFlavors,
        toast,
        onSuccess,
        onOpenChange
      });
    } catch (error) {
      console.error('Error adding product:', error);
      // Intentionally not showing any error toast to prevent flash
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    brandId,
    setBrandId,
    productName,
    setProductName,
    nameId,
    setNameId,
    selectedProductTypes,
    setSelectedProductTypes,
    isBarista,
    setIsBarista: handleBaristaToggle,
    selectedFlavors,
    handleFlavorToggle,
    isSubmitting,
    handleSubmit,
    flavors
  };
};
