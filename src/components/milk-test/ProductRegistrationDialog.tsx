
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrandSelect } from "./BrandSelect";
import { NameSelect } from "./NameSelect";
import { ProductOptions } from "./ProductOptions";
import { Separator } from "@/components/ui/separator";
import { ProductRegistrationHeader } from "./ProductRegistrationHeader";
import { BaristaToggle } from "./BaristaToggle";
import { FlavorSelector } from "./FlavorSelector";
import { useProductRegistrationForm } from "./hooks/useProductRegistrationForm";
import { DuplicateProductAlert } from "./DuplicateProductAlert";
import { useToast } from "@/components/ui/use-toast";

interface ProductRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
}

export const ProductRegistrationDialog = ({
  open,
  onOpenChange,
  onSuccess
}: ProductRegistrationDialogProps) => {
  const [duplicateAlertOpen, setDuplicateAlertOpen] = useState(false);
  const [duplicateProductId, setDuplicateProductId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    brandId,
    setBrandId,
    productName,
    setProductName,
    nameId,
    setNameId,
    selectedProductTypes,
    setSelectedProductTypes,
    isBarista,
    setIsBarista,
    selectedFlavors,
    handleFlavorToggle,
    isSubmitting,
    setIsSubmitting,
    handleSubmit: originalHandleSubmit,
    flavors
  } = useProductRegistrationForm({ open, onOpenChange, onSuccess });
  
  // Handle form submission with duplicate product check
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate the required fields: brandId and productName
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
        onOpenChange(false);
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
  
  // Use the existing product
  const handleUseExisting = () => {
    if (duplicateProductId) {
      toast({
        title: "Using existing product",
        description: "Selected the existing product from the database"
      });
      onSuccess(duplicateProductId, brandId);
    }
  };
  
  // Modify inputs to create a unique product
  const handleModifyInputs = () => {
    // Dialog will remain open so users can modify inputs
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <ProductRegistrationHeader />
          <DialogDescription className="sr-only">
            Register a new milk product with brand, product details, properties, and flavors
          </DialogDescription>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Brand *</h3>
              <BrandSelect brandId={brandId} setBrandId={setBrandId} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Product *</h3>
              <NameSelect 
                productName={productName} 
                setProductName={setProductName} 
                onNameIdChange={setNameId} 
              />
            </div>
            
            <Separator />
            
            <BaristaToggle 
              isBarista={isBarista} 
              onToggle={setIsBarista} 
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Properties</h3>
              <ProductOptions 
                selectedTypes={selectedProductTypes} 
                setSelectedTypes={setSelectedProductTypes} 
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Flavors</h3>
              <FlavorSelector 
                flavors={flavors} 
                selectedFlavors={selectedFlavors} 
                onFlavorToggle={handleFlavorToggle} 
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-black text-white"
              >
                {isSubmitting ? "Registering..." : "Register Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <DuplicateProductAlert
        open={duplicateAlertOpen}
        onOpenChange={setDuplicateAlertOpen}
        onUseExisting={handleUseExisting}
        onModify={handleModifyInputs}
      />
    </>
  );
};
