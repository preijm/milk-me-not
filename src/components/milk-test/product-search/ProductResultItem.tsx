
import React from "react";

import { ProductData } from "./search-utils/types";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

interface ProductResultItemProps {
  product: ProductData & { id: string };
  onSelect: (productId: string) => void;
  searchTerm?: string;
}

export const ProductResultItem = ({ product, onSelect, searchTerm: _searchTerm }: ProductResultItemProps) => {
  const handleItemClick = () => {
    onSelect(product.id);
  };

  
  return (
    <div 
      className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex flex-col border-b last:border-b-0"
      onClick={handleItemClick}
    >
      <div className="font-medium text-foreground"><span translate="no">{product.brand_name}</span> - {product.product_name}</div>
      
      <div className="mt-2 flex flex-wrap gap-2.5">
        {/* Barista status */}
        {product.is_barista && (
          <ProductPropertyBadges
            isBarista={product.is_barista}
            compact={true}
            displayType="barista"
            inline
          />
        )}
        
        {/* Properties badges */}
        {product.property_names && product.property_names.length > 0 && (
          <ProductPropertyBadges
            propertyNames={product.property_names}
            compact={true}
            displayType="properties"
            inline
          />
        )}
        
        {/* Flavor badges */}
        {product.flavor_names && product.flavor_names.length > 0 && (
          <ProductPropertyBadges
            flavorNames={product.flavor_names}
            compact={true}
            displayType="flavors"
            inline
          />
        )}
      </div>
    </div>
  );
};
