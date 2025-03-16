import { ProductSearchResult } from "./types";
import { performBasicSearch } from "./basicSearch";
import { performBaristaSearch, performPropertySearch, performFlavorSearch } from "./specialSearch";
import { searchByCommonTerms, searchByPercentage } from "./commonProperties";

// Main search function that combines all search strategies
export async function searchProducts(searchTerm: string): Promise<ProductSearchResult[]> {
  if (!searchTerm || searchTerm.length < 2) return [];
  console.log('Searching for products:', searchTerm);

  const lowercaseSearchTerm = searchTerm.toLowerCase();
  // Keep spaces for user-friendly searches but also create underscore version
  const formattedSearchTerm = lowercaseSearchTerm.replace(/\s+/g, '_');
  const combinedResults: ProductSearchResult[] = [];
  const processedIds = new Set<string>(); // To track already added products

  try {
    // Try to find direct property matches first for property-specific searches
    // like "no sugar", "barista", etc.
    await performPropertySearch(lowercaseSearchTerm, processedIds, combinedResults);
    
    // If we're possibly searching for a barista product
    if (lowercaseSearchTerm.includes('barista')) {
      await performBaristaSearch(lowercaseSearchTerm, processedIds, combinedResults);
    }
    
    // Try flavor searches next
    await performFlavorSearch(lowercaseSearchTerm, processedIds, combinedResults);
    
    // If we didn't find anything specific or search term is ambiguous,
    // fall back to basic name/brand search
    if (combinedResults.length === 0) {
      await performBasicSearch(lowercaseSearchTerm, processedIds, combinedResults);
      await searchByCommonTerms(lowercaseSearchTerm, processedIds, combinedResults);
      await searchByPercentage(lowercaseSearchTerm, processedIds, combinedResults);
    }

    console.log(`Found ${combinedResults.length} combined search results`);
    
    // Log sample results for debugging
    if (combinedResults.length > 0) {
      combinedResults.slice(0, 3).forEach((result, index) => {
        console.log(`Result ${index + 1}:`, {
          id: result.id,
          name: result.name,
          brandName: result.brand_name,
          isBarista: result.is_barista,
          propertyNames: result.property_names,
          flavorNames: result.flavor_names
        });
      });
    } else {
      console.log('No results found for search term:', searchTerm);
    }

    return combinedResults;
  } catch (error) {
    console.error('Error searching for products:', error);
    return [];
  }
}
