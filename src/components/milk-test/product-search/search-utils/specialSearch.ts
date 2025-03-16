
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchResult } from "./types";
import { mapToProductSearchResult } from "./basicSearch";

// Search specifically for barista products
export async function performBaristaSearch(
  lowercaseSearchTerm: string,
  processedIds: Set<string>,
  combinedResults: ProductSearchResult[]
): Promise<void> {
  if (!lowercaseSearchTerm.includes('barista')) return;
  
  const { data: baristaResults, error: baristaError } = await supabase
    .from('product_search_view')
    .select('*')
    .eq('is_barista', true)
    .limit(20);
  
  if (baristaError) throw baristaError;
  
  if (baristaResults) {
    for (const item of baristaResults) {
      if (!processedIds.has(item.id)) {
        processedIds.add(item.id);
        combinedResults.push(mapToProductSearchResult(item));
      }
    }
  }
}

// Search for specific properties
export async function performPropertySearch(
  formattedSearchTerm: string,
  processedIds: Set<string>,
  combinedResults: ProductSearchResult[]
): Promise<void> {
  // Convert spaces to underscores to match the database format
  const searchWithUnderscores = formattedSearchTerm.replace(/ /g, '_');
  
  console.log('Performing property search with terms:', { 
    formattedSearchTerm, 
    searchWithUnderscores 
  });
  
  // Create multiple search patterns for flexibility
  const { data: propertyResults, error: propertyError } = await supabase
    .from('product_search_view')
    .select('*')
    .or(`
      property_names.cs.{%${formattedSearchTerm}%},
      property_names.cs.{${formattedSearchTerm}%},
      property_names.cs.{%${formattedSearchTerm}},
      property_names.cs.{%${searchWithUnderscores}%},
      property_names.cs.{${searchWithUnderscores}%},
      property_names.cs.{%${searchWithUnderscores}}
    `)
    .limit(20);
  
  if (propertyError) {
    console.error('Property search error:', propertyError);
    throw propertyError;
  }
  
  if (propertyResults) {
    console.log(`Found ${propertyResults.length} results from property search`);
    
    // Debug output for the first few results
    if (propertyResults.length > 0) {
      propertyResults.slice(0, 3).forEach((result, i) => {
        console.log(`Property result ${i + 1}:`, {
          id: result.id,
          name: result.product_name,
          properties: result.property_names
        });
      });
    }
    
    for (const item of propertyResults) {
      if (!processedIds.has(item.id)) {
        processedIds.add(item.id);
        combinedResults.push(mapToProductSearchResult(item));
      }
    }
  }
}

// Search for specific flavors
export async function performFlavorSearch(
  formattedSearchTerm: string,
  processedIds: Set<string>,
  combinedResults: ProductSearchResult[]
): Promise<void> {
  // Convert spaces to underscores to match the database format
  const searchWithUnderscores = formattedSearchTerm.replace(/ /g, '_');
  
  console.log('Performing flavor search with terms:', { 
    formattedSearchTerm, 
    searchWithUnderscores 
  });
  
  const { data: flavorResults, error: flavorError } = await supabase
    .from('product_search_view')
    .select('*')
    .or(`
      flavor_names.cs.{%${formattedSearchTerm}%},
      flavor_names.cs.{${formattedSearchTerm}%},
      flavor_names.cs.{%${formattedSearchTerm}},
      flavor_names.cs.{%${searchWithUnderscores}%},
      flavor_names.cs.{${searchWithUnderscores}%},
      flavor_names.cs.{%${searchWithUnderscores}}
    `)
    .limit(20);
  
  if (flavorError) {
    console.error('Flavor search error:', flavorError);
    throw flavorError;
  }
  
  if (flavorResults) {
    console.log(`Found ${flavorResults.length} results from flavor search`);
    
    // Debug output for the first few results
    if (flavorResults.length > 0) {
      flavorResults.slice(0, 3).forEach((result, i) => {
        console.log(`Flavor result ${i + 1}:`, {
          id: result.id,
          name: result.product_name,
          flavors: result.flavor_names
        });
      });
    }
    
    for (const item of flavorResults) {
      if (!processedIds.has(item.id)) {
        processedIds.add(item.id);
        combinedResults.push(mapToProductSearchResult(item));
      }
    }
  }
}
