
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductResult {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  product_types?: string[] | null;
  product_properties?: string[] | null;
  ingredients: string[] | null;
  flavor_names: string[] | null;
}

interface ProductResultItemProps {
  result: ProductResult;
  searchTerm: string;
  onSelect: () => void;
}

export const ProductResultItem = ({ result, searchTerm, onSelect }: ProductResultItemProps) => {
  const lowercaseSearchTerm = searchTerm.toLowerCase();
  
  // Helper function to check if the search term is a partial match in the product properties
  const hasMatchingProductProperty = () => {
    const properties = result.product_properties || result.product_types;
    if (!properties || properties.length === 0 || !searchTerm) return false;
    
    return properties.some(type => {
      const formattedType = type.replace(/_/g, ' ');
      return formattedType.toLowerCase().includes(lowercaseSearchTerm);
    });
  };
  
  // Format product property for display
  const formatProductProperty = (type: string) => {
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Helper to check if a flavor matches the search term
  const isMatchingFlavor = (flavor: string) => {
    if (!flavor || !searchTerm) return false;
    // More aggressive matching for flavors
    return flavor.toLowerCase().includes(lowercaseSearchTerm) || 
           lowercaseSearchTerm.includes(flavor.toLowerCase());
  };
  
  // Helper to check if an ingredient matches the search term
  const isMatchingIngredient = (ingredient: string) => {
    if (!ingredient || !searchTerm) return false;
    return ingredient.toLowerCase().includes(lowercaseSearchTerm);
  };
  
  // Combine all badges into a single array for more compact display
  const getAllBadges = () => {
    const badges = [];
    
    // Add product properties badges (prioritize "barista")
    const properties = result.product_properties || result.product_types;
    if (properties && properties.length > 0) {
      // Sort product properties to prioritize "barista"
      const sortedTypes = [...properties].sort((a, b) => {
        if (a.toLowerCase() === 'barista') return -1;
        if (b.toLowerCase() === 'barista') return 1;
        return 0;
      });
      
      sortedTypes.forEach(type => {
        const formattedType = type.replace(/_/g, ' ');
        const isMatching = lowercaseSearchTerm && 
          formattedType.toLowerCase().includes(lowercaseSearchTerm);
          
        badges.push({
          key: `type-${type}`,
          text: formatProductProperty(type),
          className: `text-xs ${isMatching ? 'bg-cream-100 font-semibold' : 
            type.toLowerCase() === 'barista' ? 'bg-cream-100' : 'bg-gray-100'}`
        });
      });
    }
    
    // Add flavor badges
    if (result.flavor_names && result.flavor_names.length > 0) {
      result.flavor_names
        .filter(flavor => flavor !== null)
        .forEach(flavor => {
          const isMatching = isMatchingFlavor(flavor);
          badges.push({
            key: `flavor-${flavor}`,
            text: flavor,
            className: `text-xs ${isMatching ? 'bg-yellow-100 font-semibold' : 'bg-milk-100'}`
          });
        });
    }
    
    // Add ingredient badges
    if (result.ingredients && result.ingredients.length > 0) {
      result.ingredients.forEach(ingredient => {
        const isMatching = isMatchingIngredient(ingredient);
        badges.push({
          key: `ingredient-${ingredient}`,
          text: ingredient,
          className: `text-xs ${isMatching ? 'bg-emerald-100 font-semibold' : 'bg-emerald-50'}`
        });
      });
    }
    
    return badges;
  };

  return (
    <div
      className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
      onClick={onSelect}
    >
      <div className="font-medium">{result.brand_name} - {result.name}</div>
      
      {/* Render all badges in a single, compact row */}
      <div className="flex flex-wrap gap-1 mt-1">
        {getAllBadges().map(badge => (
          <Badge 
            key={badge.key} 
            variant="outline" 
            className={badge.className}
          >
            {badge.text}
          </Badge>
        ))}
      </div>
    </div>
  );
};
