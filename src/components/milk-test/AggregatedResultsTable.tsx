
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
import { ChevronDown, ChevronUp } from "lucide-react";

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
  expandedProduct: string | null;
  toggleProductExpand: (productId: string) => void;
  isLoadingTests: boolean;
  productTests: any[];
  handleImageClick: (path: string) => void;
}

export const AggregatedResultsTable = ({
  results,
  sortConfig,
  handleSort,
  expandedProduct,
  toggleProductExpand,
  isLoadingTests,
  productTests,
  handleImageClick
}: AggregatedResultsTableProps) => {
  // Import the TestDetailsTable component here to avoid circular dependencies
  const TestDetailsTable = React.lazy(() => import("./TestDetailsTable").then(module => ({ default: module.TestDetailsTable })));

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
          <TableHead className="font-semibold text-gray-700 text-left pl-4">
            <SortableColumnHeader 
              column="brand_name" 
              label="Brand" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4 pr-0">
            <SortableColumnHeader 
              column="product_name" 
              label="Product" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4">
            <SortableColumnHeader 
              column="avg_rating" 
              label="Score" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="font-semibold text-gray-700 text-left pl-4">
            <SortableColumnHeader 
              column="count" 
              label="Tests" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
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
            <React.Fragment key={result.product_id}>
              <TableRow 
                className={`cursor-pointer hover:bg-gray-50 ${expandedProduct === result.product_id ? 'bg-gray-50 border-b-0' : ''}`}
                onClick={() => toggleProductExpand(result.product_id)}
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
                        <span className="ml-1 text-gray-400">
                          {expandedProduct === result.product_id ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${getRatingColorClass(result.avg_rating)}`}>
                    <span className="font-semibold">{result.avg_rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center justify-center rounded-full bg-gray-100 h-7 w-7">
                    <span className="text-gray-700 font-medium">{result.count}</span>
                  </div>
                </TableCell>
              </TableRow>
              
              {expandedProduct === result.product_id && (
                <TableRow>
                  <TableCell colSpan={4} className="p-0 border-t-0">
                    <div className="bg-gray-50 px-6 pt-1 pb-4 rounded-b-lg border-t border-dashed border-gray-200">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">Individual Tests</h3>
                      {isLoadingTests ? (
                        <div className="text-center py-4 text-gray-500">Loading test details...</div>
                      ) : (
                        <React.Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                          <TestDetailsTable 
                            productTests={productTests} 
                            handleImageClick={handleImageClick}
                            sortConfig={sortConfig}
                            handleSort={handleSort}
                          />
                        </React.Suspense>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  );
};

