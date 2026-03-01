
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";

// Basic search for product name and brand name
export async function performBasicSearch(
  lowercaseSearchTerm: string,
  processedIds: Set<string>,
  combinedResults: ProductSearchResult[]
): Promise<void> {
  const searchWithUnderscores = lowercaseSearchTerm.replace(/\s+/g, '_');
  
  // Build OR conditions: search across name, brand, properties, and flavors
  const orConditions = [
    `product_name.ilike.%${lowercaseSearchTerm}%`,
    `brand_name.ilike.%${lowercaseSearchTerm}%`,
    `property_names::text.ilike.%${lowercaseSearchTerm}%`,
    `property_names::text.ilike.%${searchWithUnderscores}%`,
    `flavor_names::text.ilike.%${lowercaseSearchTerm}%`,
    `flavor_names::text.ilike.%${searchWithUnderscores}%`,
  ];

  // If searching for "barista", also include is_barista = true
  if (lowercaseSearchTerm.includes('barista')) {
    orConditions.push('is_barista.eq.true');
  }

  const { data: basicResults, error: basicError } = await supabase
    .from('product_search_view')
    .select('*')
    .or(orConditions.join(','))
    .limit(30);
  
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
