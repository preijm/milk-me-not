
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { SearchBox } from "./product-search/SearchBox";
import { SearchResults } from "./product-search/SearchResults";
import { useProductSearch } from "./product-search/useProductSearch";
import { SelectedProduct } from "./product-search/SelectedProduct";
import { ProductRegistrationDialog } from "./ProductRegistrationDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ProductSearchProps {
  onSelectProduct: (productId: string, brandId: string) => void;
  onAddNew: () => void;
  selectedProductId: string;
}

export const ProductSearch = ({
  onSelectProduct,
  onAddNew,
  selectedProductId
}: ProductSearchProps) => {
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    isDropdownVisible,
    setIsDropdownVisible,
    selectedProduct
  } = useProductSearch(selectedProductId);

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    if (selectedProduct) {
      onSelectProduct(productId, selectedProduct.brand_id);
    }
    setIsDropdownVisible(false);
  };

  const handleProductRegistrationSuccess = (newProductId: string, newBrandId: string) => {
    onSelectProduct(newProductId, newBrandId);
    setIsDropdownVisible(false);
  };

  // For debugging purposes
  console.log("Search results:", searchResults);
  console.log("Is dropdown visible:", isDropdownVisible);
  console.log("Search term length:", searchTerm.length);
  console.log("Selected product ID:", selectedProductId);
  console.log("Selected product is barista:", selectedProduct?.is_barista);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFocus={() => setIsDropdownVisible(true)}
          onAddNew={onAddNew}
          onClear={() => setSearchTerm('')}
          hasSelectedProduct={!!selectedProductId}
        />
        
        {selectedProduct && (
          <SelectedProduct product={selectedProduct} />
        )}
        
        {/* Search results dropdown */}
        <SearchResults 
          results={searchResults.map(result => ({
            id: result.id,
            brand_name: result.brand_name,
            product_name: result.name,
            product_types: result.product_types,
            flavor_names: result.flavor_names,
            is_barista: result.is_barista
          }))}
          searchTerm={searchTerm}
          isLoading={isLoading}
          onSelectProduct={handleSelectProduct}
          isVisible={searchTerm.length >= 2 && !selectedProductId && isDropdownVisible}
        />
      </div>
      
      <ProductRegistrationDialog
        open={showRegistrationDialog}
        onOpenChange={setShowRegistrationDialog}
        onSuccess={handleProductRegistrationSuccess}
      />
    </div>
  );
};
