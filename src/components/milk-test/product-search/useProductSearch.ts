import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductSearchResult {
  id: string;
  name: string;
  brand_id: string;
  brand_name: string;
  property_names?: string[] | null;
  flavor_names: string[] | null;
  is_barista?: boolean;
}

export const useProductSearch = (selectedProductId?: string) => {
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
  } = useQuery({
    queryKey: ['selected_product', localSelectedProductId],
    queryFn: async () => {
      if (!localSelectedProductId) return null;
      
      console.log("Fetching selected product with ID:", localSelectedProductId);
      // Use maybeSingle instead of single for RLS compatibility
      const {
        data,
        error
      } = await supabase.from('product_search_view').select('*').eq('id', localSelectedProductId).maybeSingle();
      
      if (error) {
        console.error('Error fetching selected product:', error);
        return null;
      }
      console.log("Selected product data:", data);
      return data;
    },
    enabled: !!localSelectedProductId
  });

  // Update search term when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.brand_name} - ${selectedProduct.product_name}`);
    } else if (!localSelectedProductId) {
      // Only clear search term if localSelectedProductId is explicitly empty or null
      // This prevents clearing when the query is just loading
      if (!isLoadingSelectedProduct) {
        setSearchTerm("");
      }
    }
  }, [selectedProduct, localSelectedProductId, isLoadingSelectedProduct]);

  // Rest of the code for product search
  const {
    data: searchResults = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['product_search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      console.log('Searching for products:', searchTerm);

      const lowercaseSearchTerm = searchTerm.toLowerCase();
      // Format search term for product property search
      const formattedSearchTerm = lowercaseSearchTerm.replace(/\s+/g, '_');

      // First query - search for partial matches in product name, brand name
      const {
        data: initialResults,
        error
      } = await supabase.from('product_search_view')
        .select('*')
        .or(`product_name.ilike.%${lowercaseSearchTerm}%,brand_name.ilike.%${lowercaseSearchTerm}%`)
        .limit(20);
      
      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      // Second query - improved flavor search with partial matching
      const {
        data: flavorResults,
        error: flavorError
      } = await supabase
        .from('product_search_view')
        .select('*')
        .filter('flavor_names', 'cs', `{${lowercaseSearchTerm}}`)
        .limit(20);
      
      if (flavorError) {
        console.error('Error searching flavors:', flavorError);
      }
      
      // Additional flavor query for better partial matching
      const {
        data: additionalFlavorResults,
        error: additionalFlavorError
      } = await supabase
        .from('product_search_view')
        .select('*')
        .filter('flavor_names', 'cs', `{%${lowercaseSearchTerm}%}`)
        .limit(20);
      
      if (additionalFlavorError) {
        console.error('Error with additional flavor search:', additionalFlavorError);
      }

      // Third query - product property search with partial matching
      const {
        data: productPropertyResults,
        error: productPropertyError
      } = await supabase.from('product_search_view')
        .select('*')
        .filter('property_names', 'cs', `{%${lowercaseSearchTerm}%}`)
        .limit(20);
      
      if (productPropertyError) {
        console.error('Error searching product properties:', productPropertyError);
      }

      // Query for barista products if search term contains 'barista'
      const {
        data: baristaResults,
        error: baristaError
      } = await supabase.from('product_search_view')
        .select('*')
        .eq('is_barista', true)
        .ilike('product_name', `%${lowercaseSearchTerm}%`)
        .limit(20);
        
      if (baristaError) {
        console.error('Error searching for barista products:', baristaError);
      }

      // Combine results, removing duplicates by id
      let combinedResults = [...(initialResults || [])];
      
      // Add all additional results if they exist, avoiding duplicates
      [flavorResults, additionalFlavorResults, productPropertyResults, baristaResults].forEach(resultSet => {
        if (resultSet) {
          resultSet.forEach(item => {
            if (!combinedResults.some(existing => existing.id === item.id)) {
              combinedResults.push(item);
            }
          });
        }
      });

      // Enhanced logging for debugging RLS issues
      console.log('Combined search results:', combinedResults);
      
      if (combinedResults.length > 0) {
        combinedResults.forEach((result, index) => {
          if (index < 3) { // Log first 3 results for debugging
            console.log(`Result ${index + 1}:`, {
              id: result.id,
              productName: result.product_name,
              flavorNames: result.flavor_names,
              propertyNames: result.property_names,
              isBarista: result.is_barista
            });
          }
        });
      }

      // Transform the results to match the format expected by the component
      // Ensure flavor_names is always an array even if null
      return combinedResults.map(item => ({
        id: item.id,
        name: item.product_name,
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        property_names: item.property_names || [],
        flavor_names: item.flavor_names || [],
        is_barista: item.is_barista
      })) || [];
    },
    enabled: searchTerm.length >= 2 && !localSelectedProductId
  });

  // We'll update the dropdown visibility state based on search results
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
    clearSelectedProduct, // Add the new method
    isError
  };
};
