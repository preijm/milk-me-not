
import React from "react";
import { ProductResultItem } from "./ProductResultItem";

interface SearchResult {
  id: string;
  name: string;
  brand_id: string;
  brand_name: string;
  product_types?: string[] | null;
  product_properties?: string[] | null;
  ingredients: string[] | null;
  flavor_names: string[] | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  isLoading: boolean;
  onSelectProduct: (productId: string, brandId: string) => void;
  isVisible: boolean;
}

export const SearchResults = ({
  results,
  searchTerm,
  isLoading,
  onSelectProduct,
  isVisible
}: SearchResultsProps) => {
  // For debugging
  console.log("SearchResults component:", { isVisible, resultsLength: results.length, searchTerm });
  
  if (!isVisible) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
      ) : results.length > 0 ? (
        results.map(result => (
          <ProductResultItem 
            key={result.id} 
            result={result} 
            searchTerm={searchTerm} 
            onSelect={() => onSelectProduct(result.id, result.brand_id)} 
          />
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
      )}
    </div>
  );
};
