
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductData {
  brand_name: string;
  product_name: string;
  product_types?: string[] | null;
  product_properties?: string[] | null;
  flavor_names: string[] | null;
  ingredients: string[] | null;
}

interface SelectedProductProps {
  product: ProductData;
}

export const SelectedProduct = ({ product }: SelectedProductProps) => {
  // Get all badges in a single array for compact display
  const getAllBadges = () => {
    const badges = [];
    
    // Add product properties badges (prioritize "barista")
    const productProperties = product.product_properties || product.product_types;
    if (productProperties && productProperties.length > 0) {
      // Sort product properties to prioritize "barista"
      const sortedTypes = [...productProperties].sort((a, b) => {
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
          className: type.toLowerCase() === 'barista' ? "bg-cream-100" : "bg-gray-100"
        });
      });
    }
    
    // Add flavor badges
    if (product.flavor_names && product.flavor_names.length > 0) {
      product.flavor_names.forEach(flavor => {
        badges.push({
          key: `flavor-${flavor}`,
          text: flavor,
          className: "bg-milk-100"
        });
      });
    }
    
    // Add ingredient badges
    if (product.ingredients && product.ingredients.length > 0) {
      product.ingredients.forEach(ingredient => {
        badges.push({
          key: `ingredient-${ingredient}`,
          text: ingredient,
          className: "bg-emerald-50"
        });
      });
    }
    
    return badges;
  };

  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {getAllBadges().map(badge => (
          <Badge key={badge.key} variant="outline" className={badge.className}>
            {badge.text}
          </Badge>
        ))}
      </div>
    </div>
  );
};
