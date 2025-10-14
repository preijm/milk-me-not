import React from "react";
import { ResultCard } from "./ResultCard";
import { BaseResultsProps } from "./types";

export const MobileResultsCards = ({
  results,
  onProductClick,
  filters,
  onFiltersChange
}: Omit<BaseResultsProps, 'sortConfig' | 'handleSort'>) => {
  return (
    <>
      {results.length === 0 ? (
        <div className="md:hidden text-center py-12 text-gray-500">
          <div className="flex flex-col items-center justify-center">
            <p className="text-lg mb-2">No results found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      ) : (
        <div className="md:hidden space-y-2 flex flex-col items-center">
          {results.map((result) => (
            <ResultCard
              key={result.product_id}
              result={result}
              onProductClick={onProductClick}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          ))}
        </div>
      )}
    </>
  );
};