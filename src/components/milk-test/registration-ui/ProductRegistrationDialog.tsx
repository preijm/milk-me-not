import React, { useState, useEffect } from "react";
import {
  Kicker,
  STORY_ALERT_ACTION_CLASS,
  STORY_ALERT_CANCEL_CLASS,
  STORY_DIALOG_SURFACE,
  StoryDialog,
} from "@/components/story";
import { ProductRegistrationProvider, useProductRegistration } from "./ProductRegistrationContext";
import { ProductForm } from "./FormSections";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
      
      // Get the product's brand_id and name_id before deletion
      const { data: productData, error: productFetchError } = await supabase
        .from('products')
        .select('brand_id, name_id')
        .eq('id', editProductId)
        .single();
      
      if (productFetchError) {
        console.error('Error fetching product data:', productFetchError);
        throw productFetchError;
      }
      
      const { brand_id: productBrandId, name_id: productNameId } = productData;
      
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
      
      // Clean up orphaned brand (if no other products use it)
      if (productBrandId) {
        const { data: otherProductsWithBrand } = await supabase
          .from('products')
          .select('id')
          .eq('brand_id', productBrandId)
          .limit(1);
        
        if (!otherProductsWithBrand || otherProductsWithBrand.length === 0) {
          const { error: brandDeleteError } = await supabase
            .from('brands')
            .delete()
            .eq('id', productBrandId);
          
          if (brandDeleteError) {
            console.log('Could not delete orphaned brand:', brandDeleteError);
          } else {
            console.log('Deleted orphaned brand:', productBrandId);
          }
        }
      }
      
      // Clean up orphaned product name (if no other products use it)
      if (productNameId) {
        const { data: otherProductsWithName } = await supabase
          .from('products')
          .select('id')
          .eq('name_id', productNameId)
          .limit(1);
        
        if (!otherProductsWithName || otherProductsWithName.length === 0) {
          const { error: nameDeleteError } = await supabase
            .from('names')
            .delete()
            .eq('id', productNameId);
          
          if (nameDeleteError) {
            console.log('Could not delete orphaned name:', nameDeleteError);
          } else {
            console.log('Deleted orphaned name:', productNameId);
          }
        }
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
      <StoryDialog
        open={open}
        onOpenChange={handleOpenChange}
        kicker={editProductId ? "Edit a product" : "Add a product"}
        title={editProductId ? "Fix what's wrong with it." : "Put a carton on the shelf."}
        // The old dialog hid this behind a "?" icon as a wall of tooltip text.
        // It is the instruction for the form directly underneath, so it is copy.
        lede={
          editProductId
            ? "Changes show on every rating already filed against this product."
            : "Brand and product name are required — name it after what is actually in it. Flavour, barista and the rest are what stop two similar cartons collapsing into one entry."
        }
        size="xl"
        contentClassName="mt-6"
        // Editing opens on a filled form — grabbing the first field would scroll
        // the reader away from the value they came to change.
        onOpenAutoFocus={editProductId ? e => e.preventDefault() : undefined}
      >
        <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} onBrandInputReady={handleBrandInputReady} onDelete={handleDeleteClick} />
      </StoryDialog>

      
      {/* Simplified Alert dialog for duplicate products */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent className={`${STORY_DIALOG_SURFACE} sm:max-w-md`}>
          <header className="text-left">
            <Kicker>Already here</Kicker>
            <AlertDialogTitle className="story-display pt-3 text-[1.75rem] leading-tight text-story-ink">
              Someone beat you to this one.
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
              A product with exactly these properties and flavours is already on the shelf. Search for it instead —
              and if yours differs in some way, add what makes it different.
            </AlertDialogDescription>
          </header>
          <div className="mt-6 flex justify-end">
            <AlertDialogAction onClick={handleDuplicateDialogAction} className={STORY_ALERT_ACTION_CLASS}>
              Got it
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className={`${STORY_DIALOG_SURFACE} sm:max-w-md`}>
          <header className="text-left">
            <Kicker>Delete a product</Kicker>
            <AlertDialogTitle className="story-display pt-3 text-[1.75rem] leading-tight text-story-ink">
              {testCount > 0 ? `This takes ${testCount} rating${testCount !== 1 ? 's' : ''} with it.` : 'Take this one off the shelf?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
              {testCount > 0
                ? "Deleting the product deletes every rating filed against it, including other people's. There is no undo."
                : 'Nobody has rated this one yet, so nothing else goes with it. There is no undo.'}
            </AlertDialogDescription>
          </header>
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <AlertDialogCancel className={STORY_ALERT_CANCEL_CLASS}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className={`${STORY_ALERT_ACTION_CLASS} bg-story-amber-dark hover:brightness-110`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting…' : 'Delete the product'}
            </AlertDialogAction>
          </div>
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