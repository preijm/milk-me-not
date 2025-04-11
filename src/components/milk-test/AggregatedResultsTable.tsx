
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableColumnHeader } from "./SortableColumnHeader";
import { ProductPropertyBadges } from "./ProductPropertyBadges";
import { ChevronRight } from "lucide-react";

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  property_names?: string[] | null;
  is_barista?: boolean;
  flavor_names?: string[] | null;
  avg_rating: number;
  count: number;
};

interface AggregatedResultsTableProps {
  results: AggregatedResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onProductClick: (productId: string) => void;
}

export const AggregatedResultsTable = ({
  results,
  sortConfig,
  handleSort,
  onProductClick
}: AggregatedResultsTableProps) => {
  const getRatingColorClass = (rating: number) => {
    if (rating >= 8.5) return "bg-green-500 text-white";
    if (rating >= 7.5) return "bg-green-400 text-white";
    if (rating >= 6.5) return "bg-blue-400 text-white";
    if (rating >= 5.5) return "bg-yellow-400 text-gray-800";
    if (rating >= 4.5) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 border-b border-gray-200">
          <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[25%]">
            <SortableColumnHeader 
              column="brand_name" 
              label="Brand" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
              width="100%"
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4 pr-0 w-[45%]">
            <SortableColumnHeader 
              column="product_name" 
              label="Product" 
              sortConfig={sortConfig} 
              onSort={handleSort}
              width="100%" 
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[15%]">
            <SortableColumnHeader 
              column="avg_rating" 
              label="Score" 
              sortConfig={sortConfig} 
              onSort={handleSort}
              width="100%" 
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4 w-[15%]">
            <SortableColumnHeader 
              column="count" 
              label="Tests" 
              sortConfig={sortConfig} 
              onSort={handleSort}
              width="100%" 
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-12 text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg mb-2">No results found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          results.map((result) => (
            <TableRow 
              key={result.product_id}
              className="cursor-pointer hover:bg-gray-50 group"
              onClick={() => onProductClick(result.product_id)}
            >
              <TableCell className="font-medium text-gray-900">{result.brand_name}</TableCell>
              <TableCell className="pr-0">
                <div className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-medium">{result.product_name}</span>
                      {(result.is_barista || (result.property_names && result.property_names.length > 0) || (result.flavor_names && result.flavor_names.length > 0)) && (
                        <div className="inline-flex">
                          {result.is_barista && (
                            <ProductPropertyBadges 
                              isBarista={result.is_barista}
                              compact={true}
                              displayType="barista"
                              inline={true}
                            />
                          )}
                          
                          <ProductPropertyBadges 
                            propertyNames={result.property_names}
                            compact={true}
                            displayType="properties"
                            inline={true}
                          />
                          
                          <ProductPropertyBadges 
                            flavorNames={result.flavor_names}
                            compact={true}
                            displayType="flavors"
                            inline={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${getRatingColorClass(result.avg_rating)}`}>
                  <span className="font-semibold">{result.avg_rating.toFixed(1)}</span>
                </div>
              </TableCell>
              <TableCell className="relative">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center justify-center rounded-full bg-gray-100 h-7 w-7">
                    <span className="text-gray-700 font-medium">{result.count}</span>
                  </div>
                  <ChevronRight className="opacity-0 group-hover:opacity-100 text-black transition-opacity" size={24} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
