
import React from "react";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { SearchIcon } from "@/components/milk-test/SearchIcon";
import { ResultsFilter } from "@/components/milk-test/ResultsFilter";
import { SortButton } from "@/components/milk-test/SortButton";
import { MobileFilterBar } from "@/components/milk-test/MobileFilterBar";
import { AggregatedResultsTable } from "@/components/milk-test/AggregatedResultsTable";
import { AggregatedResult, SortConfig } from "@/hooks/useAggregatedResults";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
}

interface ResultsContainerProps {
  filteredResults: AggregatedResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onClearSort?: () => void;
  onProductClick: (productId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const ResultsContainer = ({
  filteredResults,
  sortConfig,
  handleSort,
  onClearSort,
  onProductClick,
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange
}: ResultsContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <>
          <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 pt-4 pb-3">
            <MobileFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              onFiltersChange={onFiltersChange}
              sortConfig={sortConfig}
              onSort={handleSort}
              onClearSort={onClearSort}
            />
          </div>
          <div className="pt-[150px] px-4">
            <AggregatedResultsTable
              results={filteredResults}
              sortConfig={sortConfig}
              handleSort={handleSort}
              onProductClick={onProductClick}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden animate-fade-in">
          <CardHeader className="bg-white/50 backdrop-blur-sm pb-4 pt-6 px-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  className="mb-0"
                  placeholder="Search by brand or product..."
                />
              </div>
              <ResultsFilter 
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AggregatedResultsTable
              results={filteredResults}
              sortConfig={sortConfig}
              handleSort={handleSort}
              onProductClick={onProductClick}
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};
