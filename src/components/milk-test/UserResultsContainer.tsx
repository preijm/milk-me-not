
import React, { useState } from "react";
import { SearchBar } from "@/components/milk-test/SearchBar";
import { MyResultsTable } from "@/components/milk-test/MyResultsTable";
import { MyResultsGrid } from "@/components/milk-test/MyResultsGrid";
import { MilkTestResult } from "@/types/milk-test";
import { SortConfig } from "@/hooks/useUserMilkTests";
import { Grid, Rows } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  onImageClick?: (path: string) => void;
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
  setViewMode,
  onImageClick
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
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-full max-w-md"
          placeholder="Search by brand or product..."
        />
        
        <div className="hidden sm:block">
          <Tabs value={viewMode} onValueChange={(v: 'grid' | 'table') => setViewMode(v)} className="w-auto">
            <TabsList className="grid w-[200px] grid-cols-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                <span>Grid</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Rows className="w-4 h-4" />
                <span>Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="block sm:hidden">
        <MyResultsGrid
          results={filteredResults}
          onEdit={onEdit}
          onDelete={handleDeleteClick}
        />
      </div>
      
      <div className="hidden sm:block">
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
            onImageClick={onImageClick}
          />
        )}
      </div>

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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
