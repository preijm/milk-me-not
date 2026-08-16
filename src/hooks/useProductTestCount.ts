import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductTestCount = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-test-count', productId],
    queryFn: async () => {
      if (!productId) return 0;
      
      console.log("Counting tests for product ID:", productId);

      // Row-level security blocks a direct count on `milk_tests` for the anon
      // role, so this goes through the same security-definer RPC the public
      // results/home pages already rely on rather than a table that only
      // authenticated owners can see rows in.
      const { data, error } = await supabase.rpc('get_aggregated_milk_tests');

      if (error) {
        console.error('Error counting product tests:', error);
        throw error;
      }

      const count = (data || []).filter((item) => item.product_id === productId).length;
      console.log(`Product ${productId} has ${count} linked tests`);
      return count;
    },
    enabled: !!productId
  });
};