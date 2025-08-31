
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
  most_recent_date: string; // New field for most recent test date
};

export const useAggregatedResults = (sortConfig: SortConfig) => {
  return useQuery({
    queryKey: ['milk-tests-aggregated', sortConfig],
    queryFn: async () => {
      console.log("Fetching with sort config:", sortConfig);
      
      // Get anonymized aggregated data - safe for public access
      const { data, error } = await supabase
        .from('milk_tests_aggregated_view')
        .select('product_id, brand_name, product_name, property_names, is_barista, flavor_names, rating, price_quality_ratio, created_at');
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      console.log("Raw data length:", data?.length);
      console.log("Sample raw data:", data && data.length > 0 ? data[0] : 'No data');
      
      // Group by product and calculate average
      const productMap = new Map<string, AggregatedResult>();
      
      data?.forEach(item => {
        if (!item.product_id) return;
        
        const key = item.product_id;
        if (!productMap.has(key)) {
          // Make sure we always have valid brand and product names
          const brandName = item.brand_name || 'Unknown Brand';
          const productName = item.product_name || 'Unknown Product';
          
          console.log(`Creating product entry: ${brandName} - ${productName}`);
          
          productMap.set(key, {
            brand_id: '', // No longer exposing brand_id for security
            brand_name: brandName,
            product_id: item.product_id,
            product_name: productName,
            property_names: item.property_names || [],
            is_barista: item.is_barista || false,
            flavor_names: item.flavor_names || [],
            avg_rating: 0,
            count: 0,
            most_recent_date: item.created_at || new Date().toISOString()
          });
        }
        
        const product = productMap.get(key)!;
        product.avg_rating = (product.avg_rating * product.count + (item.rating || 0)) / (product.count + 1);
        product.count += 1;
        
        // Update most recent date if this test is more recent
        const currentDate = item.created_at || new Date().toISOString();
        if (new Date(currentDate) > new Date(product.most_recent_date)) {
          product.most_recent_date = currentDate;
        }
      });
      
      let results = Array.from(productMap.values());
      console.log("Aggregated results before sorting:", results.length);
      
      // Manual sorting based on sortConfig
      results.sort((a, b) => {
        let comparison = 0;
        
        // Ensure we have strings to compare to avoid null reference errors
        const aBrandName = a.brand_name || '';
        const bBrandName = b.brand_name || '';
        const aProductName = a.product_name || '';
        const bProductName = b.product_name || '';
        
        if (sortConfig.column === 'brand_name') {
          comparison = aBrandName.localeCompare(bBrandName);
        } else if (sortConfig.column === 'product_name') {
          comparison = aProductName.localeCompare(bProductName);
        } else if (sortConfig.column === 'avg_rating') {
          comparison = a.avg_rating - b.avg_rating;
        } else if (sortConfig.column === 'count') {
          comparison = a.count - b.count;
        } else if (sortConfig.column === 'created_at' || sortConfig.column === 'most_recent_date') {
          comparison = new Date(a.most_recent_date).getTime() - new Date(b.most_recent_date).getTime();
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
      
      console.log("Sorted results:", results.length);
      console.log("Sample processed result:", results.length > 0 ? results[0] : 'No results');
      return results;
    },
  });
};
