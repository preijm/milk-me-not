
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
      <div className="flex flex-wrap gap-1 mt-1">
        {result.product_types && result.product_types.includes('barista') && (
          <Badge variant="outline" className="bg-cream-100 text-xs">Barista</Badge>
        )}
        {result.product_types && 
          result.product_types
            .filter(type => type.toLowerCase() !== 'barista')
            .map(type => (
              <Badge key={type} variant="outline" className="bg-gray-100 text-xs">
                {type.split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')}
              </Badge>
            ))
        }
        {result.flavor_names && result.flavor_names.length > 0 && 
          result.flavor_names.map(flavor => (
            <Badge key={flavor} variant="outline" className="bg-milk-100 text-xs">
              {flavor}
            </Badge>
          ))
        }
      </div>
      {highlightIngredients()}
    </div>
  );
};
