
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">
            <SortableColumnHeader 
              column="brand_name" 
              label="Brand" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="text-left pr-0">
            <SortableColumnHeader 
              column="product_name" 
              label="Product" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="w-auto pl-1">
            <SortableColumnHeader 
              column="property_names" 
              label="Properties" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="text-left">
            <SortableColumnHeader 
              column="avg_rating" 
              label="Score" 
              sortConfig={sortConfig} 
              onSort={handleSort} 
            />
          </TableHead>
          <TableHead className="text-left">
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
            <TableCell colSpan={5} className="text-center py-8">
              No results found
            </TableCell>
          </TableRow>
        ) : (
          results.map((result) => (
            <React.Fragment key={result.product_id}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleProductExpand(result.product_id)}
              >
                <TableCell className="font-medium">{result.brand_name}</TableCell>
                <TableCell className="pr-0">{result.product_name}</TableCell>
                <TableCell className="pl-1">
                  <ProductPropertyBadges 
                    propertyNames={result.property_names}
                    isBarista={result.is_barista}
                    flavorNames={result.flavor_names}
                    compact={true}
                  />
                </TableCell>
                <TableCell>
                  <div className="rounded-full h-8 w-8 flex items-center justify-center bg-cream-300">
                    <span className="font-semibold text-milk-500">{result.avg_rating.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>{result.count}</TableCell>
              </TableRow>
              
              {expandedProduct === result.product_id && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <div className="bg-gray-50 p-4">
                      <h3 className="text-lg font-medium mb-4">Individual Tests</h3>
                      {isLoadingTests ? (
                        <div className="text-center py-4">Loading test details...</div>
                      ) : (
                        <React.Suspense fallback={<div>Loading...</div>}>
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
