
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "./search-utils/types";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

interface ProductResultItemProps {
  product: ProductData & { id: string };
  onSelect: (productId: string) => void;
  searchTerm?: string;
}

export const ProductResultItem = ({ product, onSelect, searchTerm }: ProductResultItemProps) => {
  const handleItemClick = () => {
    onSelect(product.id);
  };

  // Check if a tag name matches the search term (with underscore/space normalization)
  const isTagMatch = (tagName: string): boolean => {
    if (!searchTerm || searchTerm.length < 2) return false;
    const search = searchTerm.toLowerCase();
    const searchSpaces = search.replace(/_/g, ' ');
    const lower = tagName.toLowerCase();
    const normalized = lower.replace(/_/g, ' ');
    return lower.includes(search) || normalized.includes(search) || lower.includes(searchSpaces) || normalized.includes(searchSpaces);
  };

  // Check if brand/product name already matches — if so, no need to highlight tags
  const nameMatches = 
    (product.brand_name || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (product.product_name || "").toLowerCase().includes((searchTerm || "").toLowerCase());

  const shouldHighlight = !nameMatches && !!searchTerm && searchTerm.length >= 2;
  
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
            className="mb-1"
            highlightTerm={shouldHighlight ? searchTerm : undefined}
          />
        )}
        
        {/* Properties badges */}
        {product.property_names && product.property_names.length > 0 && (
          <ProductPropertyBadges
            propertyNames={product.property_names}
            compact={true}
            displayType="properties"
            className="mb-1"
            highlightTerm={shouldHighlight ? searchTerm : undefined}
          />
        )}
        
        {/* Flavor badges */}
        {product.flavor_names && product.flavor_names.length > 0 && (
          <ProductPropertyBadges
            flavorNames={product.flavor_names}
            compact={true}
            displayType="flavors"
            highlightTerm={shouldHighlight ? searchTerm : undefined}
          />
        )}
      </div>
    </div>
  );
};
