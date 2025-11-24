import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductSearch } from "./ProductSearch";
import { ProductRegistrationDialog } from "./registration-ui/ProductRegistrationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
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
  setProductId
}: ProductInformationProps) => {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [registrationKey, setRegistrationKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Check if we're returning from add-product page with a selected product
  useEffect(() => {
    if (location.state?.selectedProductId && location.state?.selectedBrandId) {
      handleSelectProduct(location.state.selectedProductId, location.state.selectedBrandId);
      // Clear the state
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
    }
  }, [location.state]);
  const handleSelectProduct = (productId: string, brandId: string) => {
    console.log("ProductInformation: handleSelectProduct called with", {
      productId,
      brandId
    });

    // Update product and brand IDs
    setProductId(productId);
    setBrandId(brandId);
  };
  const handleAddNewProduct = () => {
    // On mobile/tablet, navigate to full page; on desktop, show dialog
    if (isMobile) {
      navigate('/add-product');
    } else {
      setRegistrationKey(prevKey => prevKey + 1);
      setIsRegistrationDialogOpen(true);
    }
  };
  const handleProductAdded = (productId: string, brandId: string) => {
    console.log("ProductInformation: handleProductAdded called with", {
      productId,
      brandId
    });
    setProductId(productId);
    setBrandId(brandId);
    // Don't show a toast here - the dialog component is responsible
    // for showing the appropriate toast based on whether it's a new
    // product or an existing one that was selected from the duplicate alert
  };
  return <div className="space-y-4">
      
      
      <ProductSearch onSelectProduct={handleSelectProduct} onAddNew={handleAddNewProduct} selectedProductId={productId} />
      
      {!isMobile && <ProductRegistrationDialog key={registrationKey} open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen} onSuccess={handleProductAdded} />}
    </div>;
};