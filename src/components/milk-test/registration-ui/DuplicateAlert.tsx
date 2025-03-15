
import React from "react";
import { useProductRegistration } from "./ProductRegistrationContext";
import { DuplicateProductAlert } from "../DuplicateProductAlert";

export const useDuplicateHandling = (onSuccess: (productId: string, brandId: string) => void, onClose: () => void) => {
  const { 
    duplicateAlertOpen, 
    setDuplicateAlertOpen,
    duplicateProductId,
    brandId,
    setIsSubmitting,
    toast
  } = useProductRegistration();
  
  // Use the existing product
  const handleUseExisting = () => {
    if (duplicateProductId) {
      console.log("Starting handleUseExisting with duplicateProductId:", duplicateProductId);
      
      // CRITICAL: Reset the isSubmitting state FIRST to prevent the form from remaining frozen
      setIsSubmitting(false);
      
      // Close the alert dialog
      setDuplicateAlertOpen(false);
      
      // Call onSuccess without showing a toast - the ProductInformation component
      // will handle showing the appropriate toast
      onSuccess(duplicateProductId, brandId);
      
      // Close the dialog after selecting existing product - do this last
      onClose(); 
      
      console.log("handleUseExisting completed, isSubmitting set to false");
    }
  };
  
  // Modify inputs to create a unique product
  const handleModifyInputs = () => {
    console.log("Starting handleModifyInputs");
    
    // CRITICAL: Reset the isSubmitting state FIRST
    setIsSubmitting(false);
    
    // Just close the duplicate alert dialog, main form will remain open
    setDuplicateAlertOpen(false);
    
    // DO NOT call onClose() here - we want the form to remain open
    
    console.log("handleModifyInputs completed, isSubmitting set to false");
  };
  
  return {
    duplicateAlertOpen,
    setDuplicateAlertOpen,
    handleUseExisting,
    handleModifyInputs
  };
};

export const DuplicateAlertHandler: React.FC<{
  onSuccess: (productId: string, brandId: string) => void;
  onClose: () => void;
}> = ({ onSuccess, onClose }) => {
  const {
    duplicateAlertOpen,
    setDuplicateAlertOpen,
    handleUseExisting,
    handleModifyInputs
  } = useDuplicateHandling(onSuccess, onClose);
  
  return (
    <DuplicateProductAlert
      open={duplicateAlertOpen}
      onOpenChange={setDuplicateAlertOpen}
      onUseExisting={handleUseExisting}
      onModify={handleModifyInputs}
    />
  );
};
