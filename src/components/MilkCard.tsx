
import React from "react";
import { Milk } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";

interface MilkTestResult {
  id: string;
  brand_name: string;
  property_names: string[];
  rating: number;
  notes: string | null;
  created_at: string;
  username?: string | null;
  product_name?: string;
  is_barista?: boolean;
  flavor_names?: string[] | null;
}

interface MilkCardProps {
  result: MilkTestResult;
  showUsername?: boolean;
}

export const MilkCard = ({ result, showUsername = false }: MilkCardProps) => {
  // Add a background color based on the rating
  const getBgColorClass = (rating: number) => {
    if (rating >= 4.5) return "bg-soft-green";
    if (rating >= 3.5) return "bg-soft-yellow";
    if (rating >= 2.5) return "bg-soft-blue";
    return "bg-soft-pink";
  };

  const bgColorClass = getBgColorClass(result.rating);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 animate-fade-up hover:shadow-lg transition-shadow relative h-[200px] flex flex-col ${bgColorClass} border border-gray-100`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Milk className="w-6 h-6 text-milk-400" />
          <h3 className="text-lg font-semibold text-gray-900">{result.brand_name}</h3>
        </div>
        <span className="text-sm text-milk-500">
          {new Date(result.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mb-3 flex flex-wrap gap-2">
        {/* Barista badge */}
        {result.is_barista && (
          <ProductPropertyBadges
            isBarista={result.is_barista}
            compact={true}
            displayType="barista"
          />
        )}
        
        {/* Properties badges */}
        {result.property_names && result.property_names.length > 0 && (
          <ProductPropertyBadges
            propertyNames={result.property_names}
            compact={true}
            displayType="properties"
          />
        )}
        
        {/* Flavor badges */}
        {result.flavor_names && result.flavor_names.length > 0 && (
          <ProductPropertyBadges
            flavorNames={result.flavor_names}
            compact={true}
            displayType="flavors"
          />
        )}
        
        {showUsername && result.username && (
          <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
            {result.username}
          </span>
        )}
      </div>

      <div className="flex items-center mb-3">
        <div className="bg-cream-300 rounded-full h-12 w-12 flex items-center justify-center shadow-sm">
          <span className="font-semibold text-milk-500">{(Number(result.rating) * 2).toFixed(1)}</span>
        </div>
      </div>

      <div className="flex-grow"></div>
    </div>
  );
};
