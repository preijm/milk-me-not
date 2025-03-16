
export interface ProductSearchResult {
  id: string;
  name: string;
  brand_id: string;
  brand_name: string;
  property_names?: string[] | null;
  flavor_names: string[] | null;
  is_barista?: boolean;
}

export interface SearchState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: ProductSearchResult[];
  isLoading: boolean;
  isDropdownVisible: boolean;
  setIsDropdownVisible: (visible: boolean) => void;
  selectedProduct: ProductSearchResult | null;
  clearSelectedProduct: () => void;
  isError: boolean;
}

// Add a common interface that can be used by both components
export interface ProductData {
  brand_name: string;
  product_name: string;
  property_names?: string[] | null;
  flavor_names: string[] | null;
  is_barista?: boolean;
}
