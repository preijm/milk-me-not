
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilkTestResult } from "@/types/milk-test";
import { SortConfig } from "./useAggregatedResults";

export type { SortConfig };

export const useProductTests = (productId: string | null, sortConfig: SortConfig) => {
  return useQuery({
    queryKey: ['milk-tests-details', productId, sortConfig],
    queryFn: async () => {
      if (!productId) return [];
      
      console.log(`Fetching tests for product ID: ${productId}`);
      
      // Check if user is authenticated to see full details
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Authenticated users can see all community tests for this product
        const { data: productTests, error } = await supabase.rpc('get_all_milk_tests', {
          page_limit: 200,
          page_offset: 0,
          filter_product_id: productId,
        });
        
        if (error) {
          console.error("Error fetching all product tests:", error);
          throw error;
        }
      
        // Apply sorting to the filtered tests
        const detailSortableColumns = [
          'created_at', 'username', 'rating', 'drink_preference', 'price_quality_ratio', 
          'shop_name', 'notes', 'picture_path'
        ];
        
        const sortedTests = [...productTests];
        
        if (detailSortableColumns.includes(sortConfig.column)) {
          sortedTests.sort((a, b) => {
            const aValue = a[sortConfig.column as keyof typeof a];
            const bValue = b[sortConfig.column as keyof typeof b];
            
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
            if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        } else {
          // Default ordering by created_at descending
          sortedTests.sort((a, b) => {
            const aDate = new Date(a.created_at || 0);
            const bDate = new Date(b.created_at || 0);
            return bDate.getTime() - aDate.getTime();
          });
        }
        
        console.log(`Retrieved ${sortedTests.length} community test results for product`);
        if (sortedTests.length > 0) {
          console.log("Sample community test data:", sortedTests[0]);
        }
        
        // Process all community results with full details
        const processedData = sortedTests.map(item => {
          const brandName = item.brand_name || "Unknown Brand";
          const productName = item.product_name || "Unknown Product";
          
          return {
            ...item,
            username: item.username || "Anonymous",
            brand_name: brandName,
            product_name: productName
          };
        });
        
        return processedData as MilkTestResult[];
      } else {
        // Unauthenticated users get anonymized aggregated data only. Row-level
        // security blocks a direct select on `milk_tests_aggregated_view` for
        // the anon role, so this goes through the same security-definer RPC
        // the public results/home pages already rely on, then filters to this
        // product client-side.
        const { data, error } = await supabase.rpc('get_aggregated_milk_tests');

        if (error) {
          console.error("Error fetching anonymized product data:", error);
          throw error;
        }

        const filtered = (data || []).filter((item) => item.product_id === productId);
        console.log(`Retrieved ${filtered.length} anonymized results`);

        // Process anonymized results - no user data exposed
        const processedData = filtered.map(item => {
          const brandName = item.brand_name || "Unknown Brand";
          const productName = item.product_name || "Unknown Product";
          
          return {
            ...item,
            id: '', // No individual test IDs for anonymized data
            username: "Anonymous", // All users are anonymous in public view
            brand_name: brandName,
            product_name: productName,
            notes: null, // No personal notes in public view
            shop_name: null, // No shop info in public view
            picture_path: null // No personal pictures in public view
          };
        });
        
        return processedData as MilkTestResult[];
      }
    },
    enabled: !!productId
  });
};
