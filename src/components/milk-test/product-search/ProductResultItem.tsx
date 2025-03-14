
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductResult {
  id: string;
  brand_name: string;
  product_name: string;
  property_names?: string[] | null;
  flavor_names: string[] | null;
  is_barista?: boolean;
}

interface ProductResultItemProps {
  product: ProductResult;
  onSelect: (productId: string) => void;
}

export const ProductResultItem = ({ product, onSelect }: ProductResultItemProps) => {
  const propertyNames = product.property_names || [];
  const flavorNames = product.flavor_names || [];
  
  // Use the is_barista flag directly instead of checking the array
  const isBarista = product.is_barista === true;
  
  // Debug logging
  console.log("Rendering ProductResultItem:", {
    id: product.id,
    name: product.product_name,
    flavors: flavorNames,
    properties: propertyNames,
    isBarista
  });
  
  return (
    <div 
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col"
      onClick={() => onSelect(product.id)}
    >
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      
      <div className="flex flex-wrap gap-2 mt-1">
        {/* Display product properties badges */}
        {propertyNames.map(prop => (
          <Badge 
            key={`prop-${prop}`} 
            variant="outline" 
            className={`rounded-full px-3 py-0.5 text-xs ${
              prop.toLowerCase() === 'barista' 
                ? 'bg-cream-200 border-cream-300' 
                : 'bg-gray-100 border-gray-200'
            }`}
          >
            {prop.split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')}
          </Badge>
        ))}
        
        {/* Updated flavor badges with better contrast */}
        {flavorNames.length > 0 && flavorNames.map(flavor => (
          <Badge 
            key={`flavor-${flavor}`} 
            variant="outline" 
            className="rounded-full px-3 py-0.5 text-xs bg-blue-500 text-white border-blue-600"
          >
            {flavor}
          </Badge>
        ))}
      </div>
    </div>
  );
};
