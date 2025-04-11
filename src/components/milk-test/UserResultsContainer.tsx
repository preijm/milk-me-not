
import React, { useState } from "react";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { MyResultsTable } from "@/components/milk-test/MyResultsTable";
import { MyResultsGrid } from "@/components/milk-test/MyResultsGrid";
import { MilkTestResult } from "@/types/milk-test";
import { SortConfig } from "@/hooks/useUserMilkTests";
import { Grid, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserResultsContainerProps {
  filteredResults: MilkTestResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onEdit: (result: MilkTestResult) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

export const UserResultsContainer = ({
  filteredResults,
  sortConfig,
  handleSort,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode
}: UserResultsContainerProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Create a wrapper for handleSort that doesn't change the view mode
  const handleSortWithoutViewChange = (column: string) => {
    handleSort(column);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-full max-w-md"
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
          onDelete={handleDeleteClick}
        />
      ) : (
        <MyResultsTable
          results={filteredResults}
          sortConfig={sortConfig}
          handleSort={handleSortWithoutViewChange}
          onEdit={onEdit}
          onDelete={handleDeleteClick}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the milk test from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
