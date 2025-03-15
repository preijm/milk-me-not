
import React, { useState } from "react";
import { ProductSearch } from "./ProductSearch";
import { ProductRegistrationDialog } from "./registration-ui/ProductRegistrationDialog";
import { useToast } from "@/hooks/use-toast";

interface ProductInformationProps {
  brandId: string;
  setBrandId: (id: string) => void;
  productId: string;
  setProductId: (id: string) => void;
}

export const ProductInformation = ({
  brandId,
  setBrandId,
  productId,
  setProductId,
}: ProductInformationProps) => {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectProduct = (productId: string, brandId: string) => {
    console.log("ProductInformation: handleSelectProduct called with", { productId, brandId });
    
    // Update product and brand IDs
    setProductId(productId);
    setBrandId(brandId);
    
    // Toast removed - no longer showing notification when selecting a product
  };

  const handleAddNewProduct = () => {
    setIsRegistrationDialogOpen(true);
  };

  const handleProductAdded = (productId: string, brandId: string) => {
    console.log("ProductInformation: handleProductAdded called with", { productId, brandId });
    setProductId(productId);
    setBrandId(brandId);
    // Don't show a toast here - the dialog component is responsible
    // for showing the appropriate toast based on whether it's a new
    // product or an existing one that was selected from the duplicate alert
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
      
      <ProductSearch 
        onSelectProduct={handleSelectProduct}
        onAddNew={handleAddNewProduct}
        selectedProductId={productId}
      />
      
      <ProductRegistrationDialog 
        open={isRegistrationDialogOpen}
        onOpenChange={setIsRegistrationDialogOpen}
        onSuccess={handleProductAdded}
      />
    </div>
  );
};
