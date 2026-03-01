
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";

// Basic search using the search_product_types RPC which handles name, brand, properties, and flavors
export async function performBasicSearch(
  lowercaseSearchTerm: string,
  processedIds: Set<string>,
  combinedResults: ProductSearchResult[]
): Promise<void> {
  const { data: basicResults, error: basicError } = await supabase
    .rpc('search_product_types', { search_term: lowercaseSearchTerm });
  
  if (basicError) throw basicError;
  
  if (basicResults) {
    for (const item of basicResults) {
      if (!processedIds.has(item.id)) {
        processedIds.add(item.id);
        combinedResults.push(mapToProductSearchResult(item));
      }
    }
  }
}

// Helper function to map database results to ProductSearchResult
export function mapToProductSearchResult(item: any): ProductSearchResult {
  return {
    id: item.id,
    name: item.product_name,
    brand_id: item.brand_id,
    brand_name: item.brand_name,
    property_names: item.property_names || [],
    flavor_names: item.flavor_names || [],
    is_barista: item.is_barista
  };
}
