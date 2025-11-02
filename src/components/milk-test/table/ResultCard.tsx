import React, { useState } from "react";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { format } from "date-fns";
import { AggregatedResult, FilterOptions } from "./types";

interface ResultCardProps {
  result: AggregatedResult;
  onProductClick: (productId: string) => void;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
}

export const ResultCard = ({
  result,
  onProductClick,
  filters,
  onFiltersChange
}: ResultCardProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onProductClick(result.product_id);
    
    // Reset animation after it completes
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all max-w-sm w-full ${
        isClicked 
          ? 'border-2 border-primary animate-pulse' 
          : 'border border-white/20'
      } animate-fade-in`}
      onClick={handleClick}
    >
      <div className="space-y-2">
        {/* Brand - Product with inline badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-900">
            <span translate="no">{result.brand_name || "Unknown Brand"}</span> - {result.product_name || "Unknown Product"}
          </h2>
          {(result.is_barista || (result.property_names && result.property_names.length > 0) || (result.flavor_names && result.flavor_names.length > 0)) && (
            <ProductPropertyBadges 
              isBarista={result.is_barista}
              propertyNames={result.property_names}
              flavorNames={result.flavor_names}
              compact={true}
              displayType="all"
              inline={true}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>
        
        {/* Score and Tests in horizontal layout with date on the right */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Score:</span>
              <Badge variant={getScoreBadgeVariant(result.avg_rating)} className="px-2 py-1 sm:px-2 sm:py-0.5 text-xs font-bold min-w-[2.5rem] flex items-center justify-center">
                {formatScore(result.avg_rating)}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Tests:</span>
              <Badge variant="testCount" className="px-1.5 py-1 sm:px-2 sm:py-0.5 text-xs font-medium min-w-[2rem] flex items-center justify-center">
                {result.count}
              </Badge>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-600">
              {format(new Date(result.most_recent_date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};