
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "./search-utils/types";

interface SelectedProductProps {
  product: ProductData;
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

export const SelectedProduct = ({ product }: SelectedProductProps) => {
  // Safety check - if product is invalid, don't render anything
  if (!product || !product.brand_name || !product.product_name) {
    console.log("SelectedProduct received invalid product data:", product);
    return null;
  }

  // Get all badges in a single array for compact display
  const getAllBadges = () => {
    const badges = [];
    
    // Add barista badge if applicable (with highest priority)
    if (product.is_barista === true) {
      badges.push({
        key: 'barista-badge',
        text: 'Barista',
        className: "bg-cream-200 border-cream-300 font-medium"
      });
    }
    
    // Add product properties badges with formatted names
    if (product.property_names && product.property_names.length > 0) {
      product.property_names.forEach(type => {
        badges.push({
          key: `type-${type}`,
          text: formatDisplayName(type),
          className: "bg-gray-100 border-gray-200"
        });
      });
    }
    
    // Add flavor badges with improved styling and formatted names
    if (product.flavor_names && product.flavor_names.length > 0) {
      product.flavor_names.forEach(flavor => {
        badges.push({
          key: `flavor-${flavor}`,
          text: formatDisplayName(flavor),
          className: "bg-blue-500 border-blue-600 text-white"
        });
      });
    }
    
    return badges;
  };

  // Enhanced logging for debugging
  console.log("SelectedProduct rendering with data:", {
    brandName: product.brand_name,
    productName: product.product_name,
    propertyNames: product.property_names,
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
