
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

interface ProductInfoProps {
  brand: string;
  productName?: string;
}

interface ProductDetails {
  brand_name: string;
  product_name: string;
  is_barista: boolean;
  property_names: string[] | null;
  flavor_names: string[] | null;
}

export const ProductInfo = ({ brand, productName }: ProductInfoProps) => {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!brand || !productName) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('milk_tests_view')
          .select('*')
          .eq('brand_name', brand)
          .eq('product_name', productName)
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching product details:', error);
        } else if (data) {
          setProductDetails(data);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [brand, productName]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
        <div className="mt-2 p-3 bg-gray-50 border rounded-md">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // If no product details are found, show basic info
  if (!productDetails) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
        <div className="mt-2 p-3 bg-gray-50 border rounded-md">
          <div className="font-medium">{brand} - {productName}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
      <div className="mt-2 p-3 bg-gray-50 border rounded-md">
        <div className="font-medium">{productDetails.brand_name} - {productDetails.product_name}</div>
        
        <div className="mt-2 flex flex-wrap gap-2.5">
          {/* Barista status */}
          {productDetails.is_barista && (
            <ProductPropertyBadges isBarista={productDetails.is_barista} displayType="barista" />
          )}
          
          {/* Properties badges */}
          {productDetails.property_names && productDetails.property_names.length > 0 && (
            <ProductPropertyBadges propertyNames={productDetails.property_names} displayType="properties" />
          )}
          
          {/* Flavor badges */}
          {productDetails.flavor_names && productDetails.flavor_names.length > 0 && (
            <ProductPropertyBadges flavorNames={productDetails.flavor_names} displayType="flavors" />
          )}
        </div>
      </div>
    </div>
  );
};
