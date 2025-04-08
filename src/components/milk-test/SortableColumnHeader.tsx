
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { SortConfig } from "@/hooks/useUserMilkTests";

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
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 text-blue-500" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 text-blue-500" />
    );
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(column)}
      className={`hover:bg-gray-100 px-0 h-8 font-medium text-gray-700 justify-start w-full text-left ${sortConfig.column === column ? 'text-blue-600' : ''} ${className || ''}`}
    >
      <span className="flex items-center">
        {label}
        {getSortIcon()}
      </span>
    </Button>
  );
};
