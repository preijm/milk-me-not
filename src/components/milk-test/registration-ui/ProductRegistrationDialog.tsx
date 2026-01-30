import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductRegistrationHeader } from "../ProductRegistrationHeader";
import { DialogDescription } from "@/components/ui/dialog";
import { ProductRegistrationProvider, useProductRegistration } from "./ProductRegistrationContext";
import { ProductForm } from "./FormSections";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useProductTestCount } from "@/hooks/useProductTestCount";
interface ProductRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
  editProductId?: string; // Optional product ID for edit mode
}

// Container component that handles the form submission logic
const ProductRegistrationContainer: React.FC<ProductRegistrationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  editProductId
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Get test count for delete confirmation
  const { data: testCount = 0 } = useProductTestCount(editProductId);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      console.log("Dialog closed, resetting states");
    }
  }, [open, setIsSubmitting]);

  // Simple brand input ready callback
  const handleBrandInputReady = (input: HTMLInputElement | null) => {
    console.log('Brand input ready:', input);
    // Brand input now has autoFocus, so no need for manual focus logic
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

  // Handle delete button click - show confirmation dialog
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmedDelete = async () => {
    if (!editProductId) return;
    
    try {
      setIsSubmitting(true);
      
      // First, delete any linked milk tests
      if (testCount > 0) {
        const { error: testsError } = await supabase
          .from('milk_tests')
          .delete()
          .eq('product_id', editProductId);
        
        if (testsError) {
          console.error('Error deleting linked tests:', testsError);
          toast({
            title: "Error",
            description: "Failed to delete linked tests. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Delete product properties
      const { error: propsError } = await supabase
        .from('product_properties')
        .delete()
        .eq('product_id', editProductId);
      
      if (propsError) {
        console.error('Error deleting product properties:', propsError);
      }
      
      // Delete product flavors
      const { error: flavorsError } = await supabase
        .from('product_flavors')
        .delete()
        .eq('product_id', editProductId);
      
      if (flavorsError) {
        console.error('Error deleting product flavors:', flavorsError);
      }
      
      // Finally, delete the product itself
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', editProductId);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: testCount > 0 
          ? `Product and ${testCount} linked test${testCount !== 1 ? 's' : ''} deleted successfully.`
          : "Product deleted successfully.",
      });
      
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      onSuccess('', ''); // Trigger parent to refresh
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click - just close the dialog without navigation
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOpenChange(false);
  };
  return <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="max-w-2xl max-h-[85vh] overflow-y-auto backdrop-blur-sm border border-white/20 shadow-xl bg-white"
          onOpenAutoFocus={editProductId ? (e) => e.preventDefault() : undefined}
        >
          <ProductRegistrationHeader isEditMode={!!editProductId} />
          <DialogDescription className="sr-only">
            {editProductId ? 'Edit milk product details, properties, and flavors' : 'Register a new milk product with brand, product details, properties, and flavors'}
          </DialogDescription>
          
          <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} onBrandInputReady={handleBrandInputReady} onDelete={handleDeleteClick} />
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
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
              {testCount > 0 ? (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="text-destructive font-medium">
                    Warning: This product has {testCount} linked test{testCount !== 1 ? 's' : ''}.
                  </div>
                  <div className="text-destructive/80 text-sm mt-1">
                    Deleting this product will also delete all linked tests.
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-muted-foreground">
                  This product has no linked tests.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Product"}
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