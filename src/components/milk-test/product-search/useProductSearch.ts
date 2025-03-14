
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductSearchResult {
  id: string;
  name: string;
  brand_id: string;
  brand_name: string;
  product_types?: string[] | null;
  product_properties?: string[] | null;
  ingredients: string[] | null;
  flavor_names: string[] | null;
}

export const useProductSearch = (selectedProductId?: string) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  // Fetch selected product details if available
  const {
    data: selectedProduct
  } = useQuery({
    queryKey: ['selected_product', selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return null;
      const {
        data,
        error
      } = await supabase.from('product_search_view').select('*').eq('id', selectedProductId).single();
      if (error) {
        console.error('Error fetching selected product:', error);
        return null;
      }
      return data;
    },
    enabled: !!selectedProductId
  });

  // Update search term when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(`${selectedProduct.brand_name} - ${selectedProduct.product_name}`);
    }
  }, [selectedProduct]);

  const {
    data: searchResults = [],
    isLoading
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
      // Using direct SQL filter for more reliable flavor search
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
      
      // Additional flavor query with contains approach for better partial matching
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

      // Third query - improved product property search with partial matching
      // Using the RPC function for product properties search
      const {
        data: productPropertyResults,
        error: productPropertyError
      } = await supabase.from('product_search_view')
        .select('*')
        .filter('product_types', 'cs', `{%${lowercaseSearchTerm}%}`)
        .limit(20);
      
      if (productPropertyError) {
        console.error('Error searching product properties:', productPropertyError);
      }

      // Fourth query - improved ingredients search with partial matching
      const {
        data: ingredientResults,
        error: ingredientsError
      } = await supabase.from('product_search_view')
        .select('*')
        .filter('ingredients', 'cs', `{%${lowercaseSearchTerm}%}`)
        .limit(20);
      
      if (ingredientsError) {
        console.error('Error searching ingredients:', ingredientsError);
      }

      // Combine results, removing duplicates by id
      let combinedResults = [...(initialResults || [])];
      
      // Add all additional results if they exist, avoiding duplicates
      [flavorResults, additionalFlavorResults, productPropertyResults, ingredientResults].forEach(resultSet => {
        if (resultSet) {
          resultSet.forEach(item => {
            if (!combinedResults.some(existing => existing.id === item.id)) {
              combinedResults.push(item);
            }
          });
        }
      });
      
      console.log('Search results:', combinedResults);

      // Transform the results to match the format expected by the component
      return combinedResults.map(item => ({
        id: item.id,
        name: item.product_name,
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        product_types: item.product_types,
        product_properties: item.product_types, // For backward compatibility
        ingredients: item.ingredients,
        flavor_names: item.flavor_names || []
      })) || [];
    },
    enabled: searchTerm.length >= 2 && !selectedProductId
  });

  useEffect(() => {
    setIsDropdownVisible(searchResults.length > 0);
  }, [searchResults]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    isDropdownVisible,
    setIsDropdownVisible,
    selectedProduct
  };
};
