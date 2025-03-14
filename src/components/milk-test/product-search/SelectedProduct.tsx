
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductData {
  brand_name: string;
  product_name: string;
  product_types?: string[] | null;
  flavor_names: string[] | null;
  is_barista?: boolean;
}

interface SelectedProductProps {
  product: ProductData;
}

export const SelectedProduct = ({ product }: SelectedProductProps) => {
  // Get all badges in a single array for compact display
  const getAllBadges = () => {
    const badges = [];
    
    // Add product properties badges (prioritize "barista")
    if (product.product_types && product.product_types.length > 0) {
      // Sort product properties to prioritize "barista"
      const sortedTypes = [...product.product_types].sort((a, b) => {
        if (a.toLowerCase() === 'barista') return -1;
        if (b.toLowerCase() === 'barista') return 1;
        return 0;
      });
      
      sortedTypes.forEach(type => {
        badges.push({
          key: `type-${type}`,
          text: type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
          className: type.toLowerCase() === 'barista' ? "bg-cream-200 border-cream-300" : "bg-gray-100 border-gray-200"
        });
      });
    }
    
    // Add flavor badges with the new styling
    if (product.flavor_names && product.flavor_names.length > 0) {
      product.flavor_names.forEach(flavor => {
        badges.push({
          key: `flavor-${flavor}`,
          text: flavor,
          className: "bg-gray-100 border-gray-200 text-gray-700"
        });
      });
    }
    
    return badges;
  };

  // Enhanced logging for debugging
  console.log("SelectedProduct data:", {
    product,
    brandName: product.brand_name,
    productName: product.product_name,
    productTypes: product.product_types,
    flavorNames: product.flavor_names,
    isBarista: product.is_barista
  });

  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      <div className="flex flex-wrap gap-2 mt-2">
        {getAllBadges().map(badge => (
          <Badge key={badge.key} variant="outline" className={`rounded-full px-4 py-1 ${badge.className}`}>
            {badge.text}
          </Badge>
        ))}
      </div>
    </div>
  );
};
