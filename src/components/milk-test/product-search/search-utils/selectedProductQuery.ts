
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { mapToProductSearchResult } from "./basicSearch";

// Custom hook to fetch selected product details
export function useSelectedProductQuery(productId: string | undefined) {
  return useQuery({
    queryKey: ['selected_product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      console.log("Fetching selected product with ID:", productId);
      // Use maybeSingle instead of single for RLS compatibility
      const {
        data,
        error
      } = await supabase.from('product_search_view').select('*').eq('id', productId).maybeSingle();
      
      if (error) {
        console.error('Error fetching selected product:', error);
        return null;
      }
      console.log("Selected product data:", data);
      return data ? mapToProductSearchResult(data) : null;
    },
    enabled: !!productId
  });
}
