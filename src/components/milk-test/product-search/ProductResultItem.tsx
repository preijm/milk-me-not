
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "./search-utils/types";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

interface ProductResultItemProps {
  product: ProductData & { id: string };
  onSelect: (productId: string) => void;
}

export const ProductResultItem = ({ product, onSelect }: ProductResultItemProps) => {
  // Debug logging
  console.log("Rendering ProductResultItem:", {
    id: product.id,
    name: product.product_name,
    flavors: product.flavor_names,
    properties: product.property_names,
    isBarista: product.is_barista
  });
  
  const handleItemClick = () => {
    console.log("Product item clicked:", product.id);
    onSelect(product.id);
  };
  
  return (
    <div 
      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b last:border-b-0"
      onClick={handleItemClick}
    >
      <div className="font-medium text-gray-900"><span translate="no">{product.brand_name}</span> - {product.product_name}</div>
      
      <div className="mt-2 flex flex-wrap gap-2.5">
        {/* Barista status */}
        {product.is_barista && (
          <ProductPropertyBadges
            isBarista={product.is_barista}
            compact={true}
            displayType="barista"
            className="mb-1"
          />
        )}
        
        {/* Properties badges */}
        {product.property_names && product.property_names.length > 0 && (
          <ProductPropertyBadges
            propertyNames={product.property_names}
            compact={true}
            displayType="properties"
            className="mb-1"
          />
        )}
        
        {/* Flavor badges */}
        {product.flavor_names && product.flavor_names.length > 0 && (
          <ProductPropertyBadges
            flavorNames={product.flavor_names}
            compact={true}
            displayType="flavors"
          />
        )}
      </div>
    </div>
  );
};
