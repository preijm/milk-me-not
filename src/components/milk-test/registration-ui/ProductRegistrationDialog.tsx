import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductRegistrationHeader } from "../ProductRegistrationHeader";
import { DialogDescription } from "@/components/ui/dialog";
import { ProductRegistrationProvider, useProductRegistration } from "./ProductRegistrationContext";
import { ProductForm } from "./FormSections";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
    isSubmitting,
    toast
  } = useProductRegistration();
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [brandInput, setBrandInput] = useState<HTMLInputElement | null>(null);
  const [hasInitialFocus, setHasInitialFocus] = useState(false);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setHasInitialFocus(false);
      console.log("Dialog closed, resetting states");
    }
  }, [open, setIsSubmitting]);

  // Focus the brand input when dialog opens and input is ready (only once)
  useEffect(() => {
    if (open && brandInput && !hasInitialFocus) {
      console.log('Dialog opened, attempting initial focus on brand input', brandInput);
      setHasInitialFocus(true);
      
      // Try immediate focus first
      brandInput.focus();
      
      // Also set a longer delay as backup
      const timeoutId = setTimeout(() => {
        console.log('Timeout focus attempt', brandInput);
        brandInput?.focus();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open, brandInput, hasInitialFocus]);

  // Handle brand input ready callback - focus on first time if dialog is open
  const handleBrandInputReady = (input: HTMLInputElement | null) => {
    console.log('Brand input ready:', input);
    setBrandInput(input);
    
    // Focus immediately if dialog is open and we haven't focused yet
    if (open && input && !hasInitialFocus) {
      console.log('Focusing brand input on ready since dialog is open and no initial focus yet');
      setHasInitialFocus(true);
      setTimeout(() => input.focus(), 0);
    }
  };

  // Also reset isSubmitting when duplicate dialog opens
  useEffect(() => {
    if (duplicateDialogOpen) {
      setIsSubmitting(false);
      console.log("Duplicate dialog opened, isSubmitting reset to false");
    }
  }, [duplicateDialogOpen, setIsSubmitting]);

  // Handle dialog close to ensure isSubmitting is reset and prevent default navigation
  const handleOpenChange = (newOpen: boolean) => {
    console.log("handleOpenChange called with:", newOpen, "current isSubmitting:", isSubmitting);
    if (!newOpen) {
      // Reset the isSubmitting state when the dialog is closed
      setIsSubmitting(false);
      console.log("Dialog closed, isSubmitting set to false");
    }
    onOpenChange(newOpen);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the event from bubbling up to parent forms

    console.log("Product Registration Form - submitting:", {
      brandId,
      productName
    });

    // No need for validation here - the submit button is disabled if form is invalid

    setIsSubmitting(true);
    console.log("Form submission started, isSubmitting set to true");
    try {
      // Submit the form and check if we got a duplicate product
      const result = await originalHandleSubmit(e, true); // Skip auto-success handling

      if (result?.isDuplicate) {
        // Show simple duplicate product dialog
        setDuplicateDialogOpen(true);
        setIsSubmitting(false);
        console.log("Duplicate found, isSubmitting reset to false");
      } else if (result?.productId) {
        // Normal success handling for new product - removed toast notification
        onSuccess(result.productId, brandId);
        onOpenChange(false);
      } else {
        // Something went wrong
        setIsSubmitting(false);
        console.log("No product ID returned, isSubmitting reset to false");
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setIsSubmitting(false);
      console.log("Error occurred, isSubmitting set to false");
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle the duplicate dialog close
  const handleDuplicateDialogAction = () => {
    setDuplicateDialogOpen(false);
    setIsSubmitting(false); // Ensure isSubmitting is reset
  };

  // Handle cancel button click - just close the dialog without navigation
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOpenChange(false);
  };
  return <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto backdrop-blur-sm border border-white/20 shadow-xl bg-white">
          <ProductRegistrationHeader />
          <DialogDescription className="sr-only">
            Register a new milk product with brand, product details, properties, and flavors
          </DialogDescription>
          
          <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} onBrandInputReady={handleBrandInputReady} />
        </DialogContent>
      </Dialog>
      
      {/* Simplified Alert dialog for duplicate products */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Product</AlertDialogTitle>
            <AlertDialogDescription>
              This product already exists with the exact same properties and flavors.
              You cannot register duplicate products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDuplicateDialogAction} className="bg-blue-600 hover:bg-blue-700 text-white">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};

// Wrapper component that provides the context
export const ProductRegistrationDialog: React.FC<ProductRegistrationDialogProps> = props => {
  return <ProductRegistrationProvider formProps={props}>
      <ProductRegistrationContainer {...props} />
    </ProductRegistrationProvider>;
};