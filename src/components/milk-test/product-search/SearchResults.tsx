
import React from "react";
import { ProductResultItem } from "./ProductResultItem";
import { ProductData } from "./search-utils/types";

interface ProductResult extends ProductData {
  id: string;
}

interface SearchResultsProps {
  results: ProductResult[];
  searchTerm: string;
  isLoading: boolean;
  onSelectProduct: (productId: string) => void;
  isVisible: boolean;
}

export const SearchResults = ({
  results,
  searchTerm,
  isLoading,
  onSelectProduct,
  isVisible
}: SearchResultsProps) => {
  // Enhanced debugging to check flavor data
  console.log("SearchResults component:", { 
    isVisible, 
    resultsLength: results.length, 
    searchTerm, 
    sampleResult: results.length > 0 ? results[0] : null,
    allResults: results
  });
  
  if (!isVisible) return null;

  const handleProductSelect = (productId: string) => {
    console.log("SearchResults: handleProductSelect called with:", productId);
    onSelectProduct(productId);
  };

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
      ) : results.length > 0 ? (
        results.map(product => (
          <ProductResultItem
            key={product.id}
            product={product}
            onSelect={handleProductSelect}
          />
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
      )}
    </div>
  );
};
