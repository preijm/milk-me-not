
import React from "react";
import { ProductResultItem } from "./ProductResultItem";
import { ProductData } from "./search-utils/types";
import { cn } from "@/lib/utils";
import { SUGGESTION_NOTE, SUGGESTION_PANEL, SUGGESTION_SCROLL } from "../suggestionStyles";

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
    <div className={cn(SUGGESTION_PANEL, SUGGESTION_SCROLL)}>
      {isLoading ? (
        <div className={SUGGESTION_NOTE}>Loading…</div>
      ) : results.length > 0 ? (
        results.map(product => (
          <ProductResultItem
            key={product.id}
            product={product}
            onSelect={handleProductSelect}
            searchTerm={searchTerm}
          />
        ))
      ) : (
        <div className={SUGGESTION_NOTE}>No products found</div>
      )}
    </div>
  );
};
