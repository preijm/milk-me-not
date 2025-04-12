
import React from "react";

interface ProductInfoProps {
  brand: string;
  productName?: string;
}

export const ProductInfo = ({ brand, productName }: ProductInfoProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
      <div className="p-4 bg-gray-100 rounded-md">
        <p className="font-medium">{brand}</p>
        <p className="text-sm text-gray-500">{productName}</p>
      </div>
    </div>
  );
};
