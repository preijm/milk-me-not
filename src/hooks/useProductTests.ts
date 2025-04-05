
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilkTestResult } from "@/types/milk-test";
import { SortConfig } from "./useAggregatedResults";

export const useProductTests = (expandedProduct: string | null, sortConfig: SortConfig) => {
  return useQuery({
    queryKey: ['milk-tests-details', expandedProduct, sortConfig],
    queryFn: async () => {
      if (!expandedProduct) return [];
      
      let query = supabase
        .from('milk_tests_view')
        .select('id, created_at, brand_name, product_name, rating, username, notes, shop_name, picture_path, drink_preference, property_names, is_barista, flavor_names, price_quality_ratio, shop_country_code')
        .eq('product_id', expandedProduct);
      
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
      
      const { data, error } = await query as unknown as {
        data: MilkTestResult[] | null,
        error: Error | null
      };
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!expandedProduct
  });
};
