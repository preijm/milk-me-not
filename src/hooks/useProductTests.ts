
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
        // Authenticated users can see their own tests for this product
        let query = supabase
          .from('milk_tests_view')
          .select('id, created_at, brand_name, product_name, rating, username, notes, shop_name, picture_path, drink_preference, property_names, is_barista, flavor_names, price_quality_ratio, country_code')
          .eq('product_id', productId)
          .eq('user_id', user.id); // Only show user's own tests
      
        // Add sorting based on sortConfig for all possible columns in the detail view
        const detailSortableColumns = [
          'created_at', 'username', 'rating', 'drink_preference', 'price_quality_ratio', 
          'shop_name', 'notes', 'picture_path'
        ];
        
        if (detailSortableColumns.includes(sortConfig.column)) {
          query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });
        } else {
          // Default ordering if the current sort column doesn't apply to details
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching user's product tests:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} user test results`);
        if (data && data.length > 0) {
          console.log("Sample user test data:", data[0]);
        }
        
        // Process user's own results
        const processedData = (data || []).map(item => {
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
        // Unauthenticated users get anonymized aggregated data only
        const { data, error } = await supabase
          .from('milk_tests_aggregated_view')
          .select('product_id, brand_name, product_name, rating, property_names, is_barista, flavor_names, price_quality_ratio, country_code, created_at')
          .eq('product_id', productId);
        
        if (error) {
          console.error("Error fetching anonymized product data:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} anonymized results`);
        
        // Process anonymized results - no user data exposed
        const processedData = (data || []).map(item => {
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
