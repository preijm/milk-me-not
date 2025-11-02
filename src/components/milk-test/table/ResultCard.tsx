import React, { useState } from "react";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
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
        {/* Top row: Product name and Score badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              <span translate="no">{result.brand_name || "Unknown Brand"}</span> - {result.product_name || "Unknown Product"}
            </h2>
            {/* Property badges directly below name */}
            {(result.is_barista || (result.property_names && result.property_names.length > 0) || (result.flavor_names && result.flavor_names.length > 0)) && (
              <div className="flex flex-wrap gap-2 mt-2">
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
              </div>
            )}
          </div>
          <Badge variant={getScoreBadgeVariant(result.avg_rating)} className="flex-shrink-0">
            {formatScore(result.avg_rating)}
          </Badge>
        </div>
        
        {/* Separator line */}
        <div className="border-t border-gray-200 pt-2">
          {/* Bottom row: Test count and Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <ClipboardList className="w-4 h-4" />
              <span>{result.count} test{result.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-gray-500">
              {format(new Date(result.most_recent_date), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};