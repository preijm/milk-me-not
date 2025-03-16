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

  // Enhanced product search with better support for properties, barista, and flavors
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
      const formattedSearchTerm = lowercaseSearchTerm.replace(/\s+/g, '_');
      const combinedResults = [];
      const processedIds = new Set(); // To track already added products

      // Helper function to add results without duplicates
      const addUniqueResults = (results: any[]) => {
        if (!results || !results.length) return;
        
        for (const item of results) {
          if (!processedIds.has(item.id)) {
            processedIds.add(item.id);
            combinedResults.push(item);
          }
        }
      };

      try {
        // 1. Basic search for product name and brand name
        const { data: basicResults, error: basicError } = await supabase
          .from('product_search_view')
          .select('*')
          .or(`product_name.ilike.%${lowercaseSearchTerm}%,brand_name.ilike.%${lowercaseSearchTerm}%`)
          .limit(20);
        
        if (basicError) throw basicError;
        addUniqueResults(basicResults);

        // 2. Search for barista products - prioritize if 'barista' is in the search term
        if (lowercaseSearchTerm.includes('barista')) {
          const { data: baristaResults, error: baristaError } = await supabase
            .from('product_search_view')
            .select('*')
            .eq('is_barista', true)
            .limit(20);
          
          if (baristaError) throw baristaError;
          addUniqueResults(baristaResults);
        }

        // 3. Property names search (improved matching for property terms)
        const { data: propertyResults, error: propertyError } = await supabase
          .from('product_search_view')
          .select('*')
          .filter('property_names', 'cs', `{%${formattedSearchTerm}%}`)
          .limit(20);
        
        if (propertyError) throw propertyError;
        addUniqueResults(propertyResults);

        // 4. Flavor search (with better partial matching)
        const { data: flavorResults, error: flavorError } = await supabase
          .from('product_search_view')
          .select('*')
          .filter('flavor_names', 'cs', `{%${formattedSearchTerm}%}`)
          .limit(20);
        
        if (flavorError) throw flavorError;
        addUniqueResults(flavorResults);

        // 5. Special case for percentage values or specific properties
        // For example, handling searches like "3.5%", "oat", "lactose free"
        const specialTerms = [
          "oat", "soy", "almond", "lactose", "free", "organic", 
          "1%", "2%", "3%", "3.5%", "4%", "0%", "whole", "skim", "fat"
        ];
        
        const matchedSpecialTerms = specialTerms.filter(term => 
          lowercaseSearchTerm.includes(term)
        );
        
        if (matchedSpecialTerms.length > 0) {
          for (const term of matchedSpecialTerms) {
            const formattedTerm = term.replace(/\./g, '_point_').replace(/%/g, '_percent');
            
            const { data: specialResults, error: specialError } = await supabase
              .from('product_search_view')
              .select('*')
              .or(`property_names.cs.{%${formattedTerm}%},flavor_names.cs.{%${formattedTerm}%}`)
              .limit(20);
            
            if (specialError) throw specialError;
            addUniqueResults(specialResults);
          }
        }

        console.log(`Found ${combinedResults.length} combined search results`);
        
        // Log sample results for debugging
        if (combinedResults.length > 0) {
          combinedResults.slice(0, 3).forEach((result, index) => {
            console.log(`Result ${index + 1}:`, {
              id: result.id,
              productName: result.product_name,
              brandName: result.brand_name,
              isBarista: result.is_barista,
              propertyNames: result.property_names,
              flavorNames: result.flavor_names
            });
          });
        }

        // Transform results to match expected format
        return combinedResults.map(item => ({
          id: item.id,
          name: item.product_name,
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          property_names: item.property_names || [],
          flavor_names: item.flavor_names || [],
          is_barista: item.is_barista
        }));
      } catch (error) {
        console.error('Error searching for products:', error);
        return [];
      }
    },
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
