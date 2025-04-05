
import React from "react";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { AggregatedResultsTable } from "@/components/milk-test/AggregatedResultsTable";
import { AggregatedResult, SortConfig } from "@/hooks/useAggregatedResults";
import { MilkTestResult } from "@/types/milk-test";

interface ResultsContainerProps {
  filteredResults: AggregatedResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  expandedProduct: string | null;
  toggleProductExpand: (productId: string) => void;
  isLoadingTests: boolean;
  productTests: MilkTestResult[];
  handleImageClick: (path: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const ResultsContainer = ({
  filteredResults,
  sortConfig,
  handleSort,
  expandedProduct,
  toggleProductExpand,
  isLoadingTests,
  productTests,
  handleImageClick,
  searchTerm,
  setSearchTerm
}: ResultsContainerProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="mb-4"
      />
      
      <AggregatedResultsTable
        results={filteredResults}
        sortConfig={sortConfig}
        handleSort={handleSort}
        expandedProduct={expandedProduct}
        toggleProductExpand={toggleProductExpand}
        isLoadingTests={isLoadingTests}
        productTests={productTests}
        handleImageClick={handleImageClick}
      />
    </div>
  );
};
