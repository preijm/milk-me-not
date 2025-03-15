
import React from "react";
import { Milk } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilkTestResult {
  id: string;
  brand_name: string;
  product_type_keys: string[];
  rating: number;
  notes: string | null;
  created_at: string;
  display_name?: string | null;
  product_name?: string;
}

interface MilkCardProps {
  result: MilkTestResult;
  showUsername?: boolean;
}

export const MilkCard = ({ result, showUsername = false }: MilkCardProps) => {
  // Get the first product type to display as the "type"
  const type = result.product_type_keys?.length > 0 
    ? result.product_type_keys[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : 'Unknown';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-up hover:shadow-lg transition-shadow relative h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Milk className="w-6 h-6 text-milk-400" />
          <h3 className="text-lg font-semibold text-gray-900">{result.brand_name}</h3>
        </div>
        <span className="text-sm text-milk-500">
          {new Date(result.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mb-3">
        <span className="inline-block text-milk-500 text-sm">
          {type}
        </span>
        {showUsername && result.display_name && (
          <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm ml-2">
            {result.display_name}
          </span>
        )}
      </div>

      <div className="flex items-center mb-3">
        <div className="bg-cream-300 rounded-full h-12 w-12 flex items-center justify-center">
          <span className="font-semibold text-milk-500">{(Number(result.rating) * 2).toFixed(1)}</span>
        </div>
      </div>

      <div className="flex-grow"></div>
    </div>
  );
};
