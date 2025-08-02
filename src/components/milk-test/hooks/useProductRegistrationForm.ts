
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProductFlavors } from "./useProductFlavors";
import { handleProductSubmit, resetFormState } from "./product-registration";
import { UseProductRegistrationFormProps } from "./types";

export const useProductRegistrationForm = ({
  open,
  onOpenChange,
  onSuccess,
  editProductId,
  productDetails
}: UseProductRegistrationFormProps) => {
  // Form state
  const [brandId, setBrandId] = useState("");
  const [productName, setProductName] = useState("");
  const [nameId, setNameId] = useState<string | null>(null);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [isBarista, setIsBarista] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const { toast } = useToast();

  // Reset form when dialog opens or populate with existing data
  useEffect(() => {
    if (open) {
      if (editProductId && productDetails) {
        // Edit mode - populate form with existing data
        setBrandId(productDetails.brand_id || "");
        setProductName(productDetails.product_name || "");
        setNameId(productDetails.product_name_id || null);
        setIsBarista(productDetails.is_barista || false);
        
        // Map property names to property keys for selectedProductTypes
        const propertyKeys = productDetails.property_names || [];
        setSelectedProductTypes(propertyKeys);
        
        // Map flavor names to flavor keys for selectedFlavors
        const flavorKeys = productDetails.flavor_names || [];
        setSelectedFlavors(flavorKeys);
      } else {
        // New product mode - reset form
        resetFormState({
          setBrandId,
          setProductName,
          setNameId,
          setSelectedProductTypes,
          setIsBarista,
          setSelectedFlavors,
          setIsSubmitting: () => {} // This is now handled by the context
        });
      }
    }
  }, [open, editProductId, productDetails]);

  // Fetch product_flavors
  const flavorsResult = useProductFlavors();
  const flavors = flavorsResult.data;
  const flavorQuery = flavorsResult.flavorQuery;
  
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
  
  const handleSubmit = async (e: React.FormEvent, skipAutoSuccess = false) => {
    e.preventDefault();
    
    console.log("Submitting product registration form with:", {
      brandId,
      productName,
      nameId,
      selectedProductTypes,
      isBarista,
      selectedFlavors
    });
    
    // Note: Validation is now handled in the ProductRegistrationDialog component
    
    try {
      const result = await handleProductSubmit({
        brandId,
        productName,
        nameId,
        selectedProductTypes,
        isBarista,
        selectedFlavors,
        toast,
        onSuccess: skipAutoSuccess ? () => {} : onSuccess,
        onOpenChange: skipAutoSuccess ? () => {} : onOpenChange,
        editProductId
      });
      
      return result;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
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
    originalHandleSubmit: handleSubmit,
    flavors,
    flavorQuery,
    toast
  };
};
