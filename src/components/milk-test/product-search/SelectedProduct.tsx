import React from "react";
import { ProductData } from "./search-utils/types";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
interface SelectedProductProps {
  product: ProductData;
  onEdit?: () => void;
}
export const SelectedProduct = ({
  product,
  onEdit
}: SelectedProductProps) => {
  const { data: isAdmin } = useAdminCheck();
  // Safety check - if product is invalid, don't render anything
  if (!product || !product.brand_name || !product.product_name) {
    console.log("SelectedProduct received invalid product data:", product);
    return null;
  }

  // Enhanced logging for debugging
  console.log("SelectedProduct rendering with data:", {
    brandName: product.brand_name,
    productName: product.product_name,
    propertyNames: product.property_names,
    flavorNames: product.flavor_names,
    isBarista: product.is_barista
  });
  return <div className="mt-2 p-3 bg-gray-50 border rounded-md">
      <div className="flex justify-between items-start">
        <div className="font-medium"><span translate="no">{product.brand_name}</span> - {product.product_name}</div>
        {isAdmin && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-2 flex flex-wrap gap-2.5">
        {/* Barista status */}
        {product.is_barista && <ProductPropertyBadges isBarista={product.is_barista} displayType="barista" />}
        
        {/* Properties badges */}
        {product.property_names && product.property_names.length > 0 && (
          <ProductPropertyBadges propertyNames={product.property_names} displayType="properties" />
        )}
        
        {/* Flavor badges */}
        {product.flavor_names && product.flavor_names.length > 0 && (
          <ProductPropertyBadges flavorNames={product.flavor_names} displayType="flavors" />
        )}
      </div>
    </div>;
};