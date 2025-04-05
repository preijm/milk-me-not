
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface SortableColumnHeaderProps {
  column: string;
  label: string;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  className?: string;
}

export const SortableColumnHeader = ({ 
  column, 
  label, 
  sortConfig, 
  onSort,
  className
}: SortableColumnHeaderProps) => {
  const getSortIcon = () => {
    // Only show directional icons if this column is currently sorted
    if (sortConfig.column !== column) return null;
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className={`hover:bg-transparent pl-0 ${className || ''}`}
    >
      {label} {getSortIcon()}
    </Button>
  );
};
