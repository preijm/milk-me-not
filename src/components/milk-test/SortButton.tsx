import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortConfig } from "@/hooks/useAggregatedResults";

interface SortButtonProps {
  sortConfig: SortConfig;
  onSort: (column: string) => void;
}

export const SortButton = ({ sortConfig, onSort }: SortButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { key: 'brand_name', label: 'Brand Name' },
    { key: 'product_name', label: 'Product Name' },
    { key: 'avg_rating', label: 'Score' },
    { key: 'count', label: 'Number of Tests' },
    { key: 'created_at', label: 'Date Added' }
  ];

  const currentSort = sortOptions.find(option => option.key === sortConfig.column);
  const getSortIcon = () => {
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-3 w-3" />;
    } else {
      return <ArrowDown className="h-3 w-3" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort</span>
          {currentSort && (
            <div className="flex items-center gap-1">
              {getSortIcon()}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-2">
          <h3 className="font-medium mb-3">Sort by</h3>
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onSort(option.key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                sortConfig.column === option.key 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{option.label}</span>
              {sortConfig.column === option.key && getSortIcon()}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};