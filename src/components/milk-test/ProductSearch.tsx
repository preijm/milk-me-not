
import React, { useState, useEffect } from "react";
import { SearchBox } from "./product-search/SearchBox";
import { SearchResults } from "./product-search/SearchResults";
import { useProductSearch } from "./product-search/useProductSearch";
import { SelectedProduct } from "./product-search/SelectedProduct";
import { ProductRegistrationDialog } from "./registration-ui/ProductRegistrationDialog";

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
    selectedProduct,
    clearSelectedProduct
  } = useProductSearch(selectedProductId);

  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    console.log("ProductSearch: handleSelectProduct called with productId:", productId);
    
    // Find the selected product in search results to get its brand_id
    const selected = searchResults.find(product => product.id === productId);
    
    if (selected) {
      console.log("Found selected product:", selected);
      onSelectProduct(productId, selected.brand_id);
      setIsDropdownVisible(false);
    } else {
      console.error("Selected product not found in search results:", productId);
    }
  };

  // Handle clearing the search and selected product
  const handleClearSearch = () => {
    setSearchTerm('');
    clearSelectedProduct();
    
    // Clear the selected product in the parent component
    if (selectedProductId) {
      onSelectProduct('', '');
    }
    
    // Show the dropdown again to allow for new selection
    setIsDropdownVisible(true);
  };

  const handleProductRegistrationSuccess = (newProductId: string, newBrandId: string) => {
    onSelectProduct(newProductId, newBrandId);
    setIsDropdownVisible(false);
  };

  // For debugging purposes
  console.log("ProductSearch component state:", {
    searchTerm,
    selectedProductId,
    selectedProduct,
    isProductSelected: !!selectedProductId && !!selectedProduct,
    searchResultsCount: searchResults.length
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFocus={() => setIsDropdownVisible(true)}
          onAddNew={onAddNew}
          onClear={handleClearSearch}
          hasSelectedProduct={!!selectedProductId}
        />
        
        {selectedProductId && selectedProduct && (
          <SelectedProduct product={selectedProduct} />
        )}
        
        {/* Search results dropdown */}
        <SearchResults 
          results={searchResults.map(result => ({
            id: result.id,
            brand_name: result.brand_name,
            product_name: result.name, // Fix: Use name property instead of product_name
            property_names: result.property_names,
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
