
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductResult {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  product_types: string[] | null;
  ingredients: string[] | null;
  flavor_names: string[] | null;
}

interface ProductResultItemProps {
  result: ProductResult;
  searchTerm: string;
  onSelect: () => void;
}

export const ProductResultItem = ({ result, searchTerm, onSelect }: ProductResultItemProps) => {
  // Helper function to check if the search term is a partial match in the product types
  const hasMatchingProductType = () => {
    if (!result.product_types || result.product_types.length === 0 || !searchTerm) return false;
    
    const formattedSearchTerm = searchTerm.toLowerCase().replace(/\s+/g, '_');
    return result.product_types.some(type => 
      type.toLowerCase().includes(formattedSearchTerm.toLowerCase())
    );
  };
  
  // Format product type for display
  const formatProductType = (type: string) => {
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Helper to check if a flavor matches the search term
  const isMatchingFlavor = (flavor: string) => {
    if (!flavor || !searchTerm) return false;
    return flavor.toLowerCase().includes(searchTerm.toLowerCase());
  };
  
  // Generate ingredient highlights for search results
  const highlightIngredients = () => {
    if (!result.ingredients || result.ingredients.length === 0 || !searchTerm) return null;
    
    // Search for matching ingredients (partial match)
    const matchingIngredients = result.ingredients.filter(ingredient => 
      ingredient.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingIngredients.length === 0) return null;
    
    return (
      <div className="mt-1">
        {matchingIngredients.map(ingredient => (
          <Badge key={ingredient} variant="outline" className="bg-emerald-50 text-xs mr-1">
            {ingredient}
          </Badge>
        ))}
      </div>
    );
  };

  // Generate flavor highlights for search results
  const highlightFlavors = () => {
    if (!result.flavor_names || result.flavor_names.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {result.flavor_names.map(flavor => {
          const isMatching = isMatchingFlavor(flavor);
          return (
            <Badge 
              key={flavor} 
              variant="outline" 
              className={`text-xs ${isMatching ? 'bg-yellow-100 font-medium' : 'bg-milk-100'}`}
            >
              {flavor}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
      onClick={onSelect}
    >
      <div className="font-medium">{result.brand_name} - {result.name}</div>
      
      {/* Only render if product types exist */}
      {result.product_types && result.product_types.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {result.product_types.map(type => {
            // Highlight matching product types with a different background
            // Now using partial matching
            const isMatching = searchTerm && 
              (type.toLowerCase().replace(/[_-]/g, ' ').includes(searchTerm.toLowerCase().trim()) ||
               searchTerm.toLowerCase().trim().includes(type.toLowerCase().replace(/[_-]/g, ' ')));
               
            return (
              <Badge 
                key={type} 
                variant="outline" 
                className={`text-xs ${isMatching ? 'bg-cream-100 font-medium' : 
                  type.toLowerCase() === 'barista' ? 'bg-cream-100' : 'bg-gray-100'}`}
              >
                {formatProductType(type)}
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Render flavors separately for better visibility */}
      {result.flavor_names && result.flavor_names.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {result.flavor_names
            .filter(flavor => flavor !== null)
            .map(flavor => (
              <Badge 
                key={flavor} 
                variant="outline" 
                className={`text-xs ${isMatchingFlavor(flavor) ? 'bg-yellow-100 font-medium' : 'bg-milk-100'}`}
              >
                {flavor}
              </Badge>
            ))
          }
        </div>
      )}
      
      {/* Highlight matching ingredients */}
      {highlightIngredients()}
    </div>
  );
};
