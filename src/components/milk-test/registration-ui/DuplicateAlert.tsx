
import React from "react";
import { DuplicateProductAlert } from "../DuplicateProductAlert";
import { useProductRegistration } from "./ProductRegistrationContext";

interface DuplicateAlertHandlerProps {
  onSuccess: (productId: string, brandId: string) => void;
}

export const DuplicateAlertHandler: React.FC<DuplicateAlertHandlerProps> = ({
  onSuccess
}) => {
  const {
    duplicateAlertOpen,
    setDuplicateAlertOpen,
    duplicateProductId,
    brandId,
    setIsSubmitting
  } = useProductRegistration();

  // Handle using the existing product
  const handleUseExisting = () => {
    console.log("Using existing product:", duplicateProductId);
    // Reset the submitting state
    setIsSubmitting(false);
    
    // Only call onSuccess if we have a valid product ID
    if (duplicateProductId) {
      onSuccess(duplicateProductId, brandId);
    }
    
    // Close the alert
    setDuplicateAlertOpen(false);
  };

  // Handle modifying inputs (just close the alert and return to form)
  const handleModify = () => {
    console.log("User chose to modify inputs");
    // Reset the submitting state
    setIsSubmitting(false);
    // Close the alert
    setDuplicateAlertOpen(false);
  };

  // Handle dialog close via ESC or clicking outside
  const handleAlertOpenChange = (open: boolean) => {
    console.log("Alert open state changing to:", open);
    if (!open) {
      // Reset the submitting state when alert is closed
      setIsSubmitting(false);
      setDuplicateAlertOpen(false);
    }
  };

  return (
    <DuplicateProductAlert
      open={duplicateAlertOpen}
      onOpenChange={handleAlertOpenChange}
      onUseExisting={handleUseExisting}
      onModify={handleModify}
    />
  );
};
