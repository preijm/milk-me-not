import React from "react";
import { ProductData } from "./search-utils/types";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
interface SelectedProductProps {
  product: ProductData;
}
export const SelectedProduct = ({
  product
}: SelectedProductProps) => {
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
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      
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