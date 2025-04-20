
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilkTestResult } from "@/types/milk-test";

export type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

export type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  property_names?: string[] | null;
  is_barista?: boolean;
  flavor_names?: string[] | null;
  avg_rating: number;
  count: number;
};

export const useAggregatedResults = (sortConfig: SortConfig) => {
  return useQuery({
    queryKey: ['milk-tests-aggregated', sortConfig],
    queryFn: async () => {
      console.log("Fetching with sort config:", sortConfig);
      
      // Get all milk test data first - no auth check needed for public data
      const { data, error } = await supabase
        .from('milk_tests_view')
        .select('brand_id, brand_name, product_id, product_name, property_names, is_barista, flavor_names, rating, price_quality_ratio') as unknown as {
          data: MilkTestResult[] | null,
          error: Error | null
        };
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Raw data length:", data?.length);
      
      // Group by product and calculate average
      const productMap = new Map<string, AggregatedResult>();
      
      data?.forEach(item => {
        if (!item.product_id) return;
        
        const key = item.product_id;
        if (!productMap.has(key)) {
          productMap.set(key, {
            brand_id: item.brand_id || '',
            brand_name: item.brand_name || '',
            product_id: item.product_id,
            product_name: item.product_name || '',
            property_names: item.property_names || null,
            is_barista: item.is_barista || false,
            flavor_names: item.flavor_names || null,
            avg_rating: 0,
            count: 0
          });
        }
        
        const product = productMap.get(key)!;
        product.avg_rating = (product.avg_rating * product.count + (item.rating || 0)) / (product.count + 1);
        product.count += 1;
      });
      
      let results = Array.from(productMap.values());
      console.log("Aggregated results before sorting:", results.length);
      
      // Manual sorting based on sortConfig
      results.sort((a, b) => {
        let comparison = 0;
        
        if (sortConfig.column === 'brand_name') {
          comparison = (a.brand_name || '').localeCompare(b.brand_name || '');
        } else if (sortConfig.column === 'product_name') {
          comparison = (a.product_name || '').localeCompare(b.product_name || '');
        } else if (sortConfig.column === 'avg_rating') {
          comparison = a.avg_rating - b.avg_rating;
        } else if (sortConfig.column === 'count') {
          comparison = a.count - b.count;
        } 
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
      
      console.log("Sorted results:", results.length);
      return results;
    },
  });
};
