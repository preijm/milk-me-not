
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProductData {
  brand_name: string;
  product_name: string;
  product_types: string[] | null;
  flavor_names: string[] | null;
  ingredients: string[] | null;
}

interface SelectedProductProps {
  product: ProductData;
}

export const SelectedProduct = ({ product }: SelectedProductProps) => {
  // Function to format product types, prioritizing "Barista" and converting snake_case to Title Case
  const formatProductTypes = (productTypes: string[] | null): JSX.Element[] => {
    if (!productTypes || productTypes.length === 0) return [];
    
    // Sort product types to prioritize "barista"
    const sortedTypes = [...productTypes].sort((a, b) => {
      if (a.toLowerCase() === 'barista') return -1;
      if (b.toLowerCase() === 'barista') return 1;
      return 0;
    });
    
    // Create badges for each product type
    return sortedTypes.map(type => (
      <Badge key={type} variant="outline" className={type.toLowerCase() === 'barista' ? "bg-cream-100" : "bg-gray-100"}>
        {type.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')}
      </Badge>
    ));
  };

  return (
    <div className="mt-2 p-3 bg-gray-50 border rounded-md">
      <div className="font-medium">{product.brand_name} - {product.product_name}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {/* Product types */}
        {product.product_types && formatProductTypes(product.product_types)}
        
        {/* Flavors */}
        {product.flavor_names && product.flavor_names.length > 0 && 
          product.flavor_names.map(flavor => (
            <Badge key={flavor} variant="outline" className="bg-milk-100">
              {flavor}
            </Badge>
          ))
        }
        
        {/* Ingredients */}
        {product.ingredients && product.ingredients.length > 0 && 
          product.ingredients.map(ingredient => (
            <Badge key={ingredient} variant="outline" className="bg-emerald-50">
              {ingredient}
            </Badge>
          ))
        }
      </div>
    </div>
  );
};
