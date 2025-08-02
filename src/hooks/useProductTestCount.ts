import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductTestCount = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-test-count', productId],
    queryFn: async () => {
      if (!productId) return 0;
      
      console.log("Counting tests for product ID:", productId);
      
      const { count, error } = await supabase
        .from('milk_tests')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);
      
      if (error) {
        console.error('Error counting product tests:', error);
        throw error;
      }
      
      console.log(`Product ${productId} has ${count} linked tests`);
      return count || 0;
    },
    enabled: !!productId
  });
};