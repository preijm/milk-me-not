
import React, { useState } from "react";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { MyResultsTable } from "@/components/milk-test/MyResultsTable";
import { MyResultsGrid } from "@/components/milk-test/MyResultsGrid";
import { MilkTestResult } from "@/types/milk-test";
import { SortConfig } from "@/hooks/useUserMilkTests";
import { Grid, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserResultsContainerProps {
  filteredResults: MilkTestResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onEdit: (result: MilkTestResult) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const UserResultsContainer = ({
  filteredResults,
  sortConfig,
  handleSort,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm
}: UserResultsContainerProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-full sm:w-auto"
          placeholder="Search by brand or product..."
        />
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-1"
          >
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button 
            variant={viewMode === 'table' ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-1"
          >
            <Rows className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <MyResultsGrid
          results={filteredResults}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <MyResultsTable
          results={filteredResults}
          sortConfig={sortConfig}
          handleSort={handleSort}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
