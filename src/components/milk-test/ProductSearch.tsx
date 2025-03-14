
import React from "react";
import { SearchBox } from "./product-search/SearchBox";
import { SearchResults } from "./product-search/SearchResults";
import { SelectedProduct } from "./product-search/SelectedProduct";
import { useProductSearch } from "./product-search/useProductSearch";

interface ProductSearchProps {
  onSelectProduct: (productId: string, brandId: string) => void;
  onAddNew: () => void;
  selectedProductId?: string;
}

export const ProductSearch = ({
  onSelectProduct,
  onAddNew,
  selectedProductId
}: ProductSearchProps) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    isDropdownVisible,
    setIsDropdownVisible,
    selectedProduct
  } = useProductSearch(selectedProductId);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Clear selected product if user is typing new search
    if (selectedProductId) {
      onSelectProduct("", "");
    }
    
    // Always show dropdown when user is typing
    if (value.length >= 2) {
      setIsDropdownVisible(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSelectProduct("", "");
    setIsDropdownVisible(false);
  };

  const handleSelectProduct = (productId: string, brandId: string) => {
    onSelectProduct(productId, brandId);
    setIsDropdownVisible(false);
  };

  // For debugging purposes
  console.log("Search results:", searchResults);
  console.log("Is dropdown visible:", isDropdownVisible);
  console.log("Search term length:", searchTerm.length);
  console.log("Selected product ID:", selectedProductId);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchBox 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddNew={onAddNew}
          onClear={handleClearSearch}
          hasSelectedProduct={!!selectedProductId}
        />
        
        {/* Selected product details */}
        {selectedProduct && <SelectedProduct product={{
          ...selectedProduct,
          product_properties: selectedProduct.product_types // Add for compatibility
        }} />}
        
        {/* Search results dropdown - modified to ensure visibility */}
        <SearchResults 
          results={searchResults}
          searchTerm={searchTerm}
          isLoading={isLoading}
          onSelectProduct={handleSelectProduct}
          isVisible={searchTerm.length >= 2 && !selectedProductId}
        />
      </div>
    </div>
  );
};
