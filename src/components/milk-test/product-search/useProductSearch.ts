import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "./search-utils/searchProducts";
import { useSelectedProductQuery } from "./search-utils/selectedProductQuery";
import { SearchState } from "./search-utils/types";

export const useProductSearch = (selectedProductId?: string): SearchState => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [localSelectedProductId, setLocalSelectedProductId] = useState(selectedProductId);
  
  // Keep local state in sync with prop
  useEffect(() => {
    setLocalSelectedProductId(selectedProductId);
  }, [selectedProductId]);
  
  // Custom setter for search term that also manages the selected product state
  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    
    // If we're clearing the search or starting a new one, also clear the selected product locally
    if (term === "" && localSelectedProductId) {
      setLocalSelectedProductId(undefined);
    }
  };

  // Method to explicitly clear the selected product
  const clearSelectedProduct = () => {
    setLocalSelectedProductId(undefined);
  };
  
  // Fetch selected product details if available
  const {
    data: selectedProduct,
    isLoading: isLoadingSelectedProduct
  } = useSelectedProductQuery(localSelectedProductId);

  // Update search term when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.brand_name} - ${selectedProduct.name}`);
    } else if (!localSelectedProductId) {
      // Only clear search term if localSelectedProductId is explicitly empty or null
      // This prevents clearing when the query is just loading
      if (!isLoadingSelectedProduct) {
        setSearchTerm("");
      }
    }
  }, [selectedProduct, localSelectedProductId, isLoadingSelectedProduct]);

  // Enhanced product search with improved partial matching for all fields
  const {
    data: searchResults = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['product_search', searchTerm],
    queryFn: () => searchProducts(searchTerm),
    enabled: searchTerm.length >= 2 && !localSelectedProductId
  });

  // Update dropdown visibility based on search results
  useEffect(() => {
    if (searchTerm.length >= 2 && !localSelectedProductId) {
      setIsDropdownVisible(true);
    } else {
      setIsDropdownVisible(false);
    }
  }, [searchTerm, searchResults, localSelectedProductId, isLoading]);

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    searchResults,
    isLoading,
    isDropdownVisible,
    setIsDropdownVisible,
    selectedProduct,
    clearSelectedProduct,
    isError
  };
};
