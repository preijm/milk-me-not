
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortConfig } from "@/hooks/useUserMilkTests";

interface SortableColumnHeaderProps {
  column: string;
  label: string;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  className?: string;
  width?: string;
}

export const SortableColumnHeader = ({ 
  column, 
  label, 
  sortConfig, 
  onSort,
  className,
  width
}: SortableColumnHeaderProps) => {
  const getSortIcon = () => {
    // Only show directional icons if this column is currently sorted
    if (sortConfig.column !== column) {
      return null; // Don't show any icon for unsorted columns
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 text-brand-secondary" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 text-brand-secondary" />
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className={`hover:bg-gray-100 px-0 h-8 font-medium text-gray-700 justify-start w-full text-left ${sortConfig.column === column ? 'font-semibold text-brand-secondary' : ''} ${className || ''}`}
      style={width ? { width } : {}}
    >
      <span className="flex items-center whitespace-nowrap">
        {label}
        {getSortIcon()}
      </span>
    </Button>
  );
};
