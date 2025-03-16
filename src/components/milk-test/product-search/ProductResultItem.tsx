
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "./search-utils/types";

interface ProductResultItemProps {
  product: ProductData & { id: string };
  onSelect: (productId: string) => void;
}

// Helper function to format keys like "pumpkin_spice" to "Pumpkin Spice"
// and "three_point_five_percent" to "3.5%"
const formatDisplayName = (key: string): string => {
  // Special case for percentage values
  if (key.includes('point') && key.includes('percent')) {
    return key.replace(/_point_/g, '.')
              .replace(/_percent/g, '%')
              .replace(/one/g, '1')
              .replace(/two/g, '2')
              .replace(/three/g, '3')
              .replace(/four/g, '4')
              .replace(/five/g, '5')
              .replace(/six/g, '6')
              .replace(/seven/g, '7')
              .replace(/eight/g, '8')
              .replace(/nine/g, '9')
              .replace(/zero/g, '0');
  }
  
  // Regular formatting for other keys: capitalize each word and replace underscores with spaces
  return key.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ProductResultItem = ({ product, onSelect }: ProductResultItemProps) => {
  const propertyNames = product.property_names || [];
  const flavorNames = product.flavor_names || [];
  
  // Use the is_barista flag directly from the product
  const isBarista = product.is_barista === true;
  
  // Debug logging
  console.log("Rendering ProductResultItem:", {
    id: product.id,
    name: product.product_name,
    flavors: flavorNames,
    properties: propertyNames,
    isBarista
  });
  
  const handleItemClick = () => {
    console.log("Product item clicked:", product.id);
    onSelect(product.id);
  };
  
  return (
    <div 
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col"
      onClick={handleItemClick}
    >
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      
      <div className="flex flex-wrap gap-2 mt-1">
        {/* Display barista badge if applicable */}
        {isBarista && (
          <Badge 
            variant="outline" 
            className="rounded-full px-3 py-0.5 text-xs bg-cream-200 border-cream-300 font-medium"
          >
            Barista
          </Badge>
        )}
        
        {/* Display product properties badges with formatted names */}
        {propertyNames.map(prop => (
          <Badge 
            key={`prop-${prop}`} 
            variant="outline" 
            className="rounded-full px-3 py-0.5 text-xs bg-gray-100 border-gray-200"
          >
            {formatDisplayName(prop)}
          </Badge>
        ))}
        
        {/* Display flavor badges with better contrast and formatted names */}
        {flavorNames.length > 0 && flavorNames.map(flavor => (
          <Badge 
            key={`flavor-${flavor}`} 
            variant="outline" 
            className="rounded-full px-3 py-0.5 text-xs bg-blue-500 text-white border-blue-600"
          >
            {formatDisplayName(flavor)}
          </Badge>
        ))}
      </div>
    </div>
  );
};
