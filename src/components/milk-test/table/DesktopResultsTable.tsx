import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableColumnHeader } from "../SortableColumnHeader";
import { ResultTableRow } from "./ResultTableRow";
import { BaseResultsProps } from "./types";

export const DesktopResultsTable = ({
  results,
  sortConfig,
  handleSort,
  onProductClick,
  filters,
  onFiltersChange
}: BaseResultsProps) => {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700 text-left pl-4 md:w-[18%] lg:w-[22%]">
              <SortableColumnHeader 
                column="brand_name" 
                label="Brand" 
                sortConfig={sortConfig} 
                onSort={handleSort} 
                width="100%"
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 pr-0 md:w-[46%] lg:w-[40%]">
              <SortableColumnHeader 
                column="product_name" 
                label="Product" 
                sortConfig={sortConfig} 
                onSort={handleSort}
                width="100%" 
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 md:w-[10%] lg:w-[10%]">
              <SortableColumnHeader 
                column="avg_rating" 
                label="Score" 
                sortConfig={sortConfig} 
                onSort={handleSort}
                width="100%" 
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 md:w-[10%] lg:w-[10%]">
              <SortableColumnHeader 
                column="count" 
                label="Tests" 
                sortConfig={sortConfig} 
                onSort={handleSort}
                width="100%" 
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-left pl-4 md:w-[16%] lg:w-[18%]">
              <SortableColumnHeader 
                column="most_recent_date" 
                label="Latest Test" 
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
              <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-lg mb-2">No results found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            results.map((result) => (
              <ResultTableRow
                key={result.product_id}
                result={result}
                onProductClick={onProductClick}
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};