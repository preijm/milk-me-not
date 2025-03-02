
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
  // Helper function to check if a product type matches the search term
  const hasMatchingProductType = () => {
    if (!result.product_types || result.product_types.length === 0) return false;
    
    const formattedSearchTerm = searchTerm.toLowerCase().replace(/\s+/g, '_');
    return result.product_types.some(type => 
      type.toLowerCase() === formattedSearchTerm.toLowerCase()
    );
  };
  
  // Format product type for display
  const formatProductType = (type: string) => {
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Generate ingredient highlights for search results
  const highlightIngredients = () => {
    if (!result.ingredients || result.ingredients.length === 0) return null;
    
    // Search for matching ingredients
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
            const isMatching = searchTerm && type.toLowerCase().replace(/[_-]/g, ' ') === searchTerm.toLowerCase().trim();
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
          
          {/* Only render flavors if they exist */}
          {result.flavor_names && result.flavor_names.length > 0 && 
            result.flavor_names
              .filter(flavor => flavor !== null)
              .map(flavor => (
                <Badge key={flavor} variant="outline" className="bg-milk-100 text-xs">
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
