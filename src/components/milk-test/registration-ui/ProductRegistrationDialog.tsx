
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductRegistrationHeader } from "../ProductRegistrationHeader";
import { DialogDescription } from "@/components/ui/dialog";
import { 
  ProductRegistrationProvider,
  useProductRegistration
} from "./ProductRegistrationContext";
import { ProductForm } from "./FormSections";
import { DuplicateAlertHandler } from "./DuplicateAlert";
import { useToast } from "@/hooks/use-toast";

interface ProductRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
}

// Container component that handles the form submission logic
const ProductRegistrationContainer: React.FC<ProductRegistrationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const {
    brandId,
    productName,
    originalHandleSubmit,
    setIsSubmitting,
    setDuplicateProductId,
    setDuplicateAlertOpen,
    toast
  } = useProductRegistration();
  
  // Handle dialog close to ensure isSubmitting is reset
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset the isSubmitting state when the dialog is closed
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };
  
  // Handle form submission with duplicate product check
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Product Registration Form - validating fields:", {
      brandId, 
      productName
    });
    
    // CRITICAL: Only validate the required fields for PRODUCT REGISTRATION: brandId and productName
    if (!brandId || brandId.trim() === '') {
      toast({
        title: "Missing required field",
        description: "Please enter a brand",
        variant: "destructive"
      });
      return;
    }
    
    if (!productName || productName.trim() === '') {
      toast({
        title: "Missing required field",
        description: "Please enter a product name",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await originalHandleSubmit(e, true); // Pass true to skip auto-success
      
      if (result?.isDuplicate && result?.productId) {
        // Show duplicate product alert
        setDuplicateProductId(result.productId);
        setDuplicateAlertOpen(true);
        setIsSubmitting(false); // Clear submitting state to unfreeze the button
      } else if (result?.productId) {
        // Success with new product
        toast({
          title: "Product added",
          description: "New product added successfully!"
        });
        onSuccess(result.productId, brandId);
        handleOpenChange(false);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <ProductRegistrationHeader />
          <DialogDescription className="sr-only">
            Register a new milk product with brand, product details, properties, and flavors
          </DialogDescription>
          
          <ProductForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
      
      <DuplicateAlertHandler 
        onSuccess={onSuccess} 
        onClose={() => handleOpenChange(false)} 
      />
    </>
  );
};

// Wrapper component that provides the context
export const ProductRegistrationDialog: React.FC<ProductRegistrationDialogProps> = (props) => {
  const { toast } = useToast();
  
  return (
    <ProductRegistrationProvider formProps={props}>
      <ProductRegistrationContainer {...props} />
    </ProductRegistrationProvider>
  );
};
