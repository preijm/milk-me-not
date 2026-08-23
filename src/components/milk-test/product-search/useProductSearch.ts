import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "./search-utils/searchProducts";
import { useSelectedProductQuery } from "./search-utils/selectedProductQuery";
import { SearchState } from "./search-utils/types";

// Stable reference for the not-yet-loaded case — same reason as NO_SHOPS in
// ShopSelect. `searchResults` is compared below to decide whether the dropdown
// should reopen, and a fresh `[]` literal every render would make that
// comparison always true, re-rendering forever.
const NO_RESULTS: Awaited<ReturnType<typeof searchProducts>> = [];

export const useProductSearch = (selectedProductId?: string): SearchState => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [localSelectedProductId, setLocalSelectedProductId] = useState(selectedProductId);

  // Follow the prop when it changes from outside. Compared during render rather
  // than in an effect, so a product chosen elsewhere does not spend a frame
  // showing the previous one.
  const [seenProductId, setSeenProductId] = useState(selectedProductId);
  if (seenProductId !== selectedProductId) {
    setSeenProductId(selectedProductId);
    setLocalSelectedProductId(selectedProductId);
  }

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

  // Put the chosen product's name in the box, and empty it when the choice goes
  // away — but not while the lookup is still in flight, or the field blanks out
  // mid-fetch. Same three triggers the effect had.
  const [seenSelection, setSeenSelection] = useState<{
    product: typeof selectedProduct;
    id: string | undefined;
    loading: boolean;
  } | null>(null);

  if (
    !seenSelection ||
    seenSelection.product !== selectedProduct ||
    seenSelection.id !== localSelectedProductId ||
    seenSelection.loading !== isLoadingSelectedProduct
  ) {
    setSeenSelection({
      product: selectedProduct,
      id: localSelectedProductId,
      loading: isLoadingSelectedProduct,
    });

    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.brand_name} - ${selectedProduct.name}`);
    } else if (!localSelectedProductId && !isLoadingSelectedProduct) {
      setSearchTerm("");
    }
  }

  // Enhanced product search with improved partial matching for all fields
  const {
    data: searchResults = NO_RESULTS,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['product_search', searchTerm],
    queryFn: () => searchProducts(searchTerm),
    enabled: searchTerm.length >= 2 && !localSelectedProductId
  });

  // Reopen the dropdown whenever the search moves. The consumer closes it on
  // blur and on pick, and this re-opens it on the next change — which is what
  // the effect did, including reacting to results arriving.
  const [seenSearch, setSeenSearch] = useState<{
    term: string;
    results: typeof searchResults;
    id: string | undefined;
    loading: boolean;
  } | null>(null);

  if (
    !seenSearch ||
    seenSearch.term !== searchTerm ||
    seenSearch.results !== searchResults ||
    seenSearch.id !== localSelectedProductId ||
    seenSearch.loading !== isLoading
  ) {
    setSeenSearch({
      term: searchTerm,
      results: searchResults,
      id: localSelectedProductId,
      loading: isLoading,
    });
    setIsDropdownVisible(searchTerm.length >= 2 && !localSelectedProductId);
  }

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
