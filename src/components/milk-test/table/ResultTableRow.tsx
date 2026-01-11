import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ProductPropertyBadges } from "@/components/milk-test/ProductPropertyBadges";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
import { format } from "date-fns";
import { AggregatedResult, FilterOptions } from "./types";

interface ResultTableRowProps {
  result: AggregatedResult;
  onProductClick: (productId: string) => void;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
}

export const ResultTableRow = ({
  result,
  onProductClick,
  filters,
  onFiltersChange
}: ResultTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-gray-50 group"
      onClick={() => onProductClick(result.product_id)}
    >
      <TableCell className="font-medium text-gray-900">
        <span translate="no">{result.brand_name || "Unknown Brand"}</span>
      </TableCell>
      <TableCell className="pr-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-800">
            {result.product_name || "Unknown Product"}
          </span>
          {(result.is_barista || (result.property_names && result.property_names.length > 0) || (result.flavor_names && result.flavor_names.length > 0)) && (
            <ProductPropertyBadges 
              isBarista={result.is_barista}
              propertyNames={result.property_names}
              flavorNames={result.flavor_names}
              compact={true}
              displayType="all"
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getScoreBadgeVariant(result.avg_rating)}>
          {formatScore(result.avg_rating)}
        </Badge>
      </TableCell>
      <TableCell className="relative">
        <div className="flex items-center justify-between">
          <Badge variant="testCount">
            {result.count}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {format(new Date(result.most_recent_date), 'MMM dd, yyyy')}
          </span>
          <ChevronRight className="opacity-0 group-hover:opacity-100 text-black transition-opacity" size={24} />
        </div>
      </TableCell>
    </TableRow>
  );
};