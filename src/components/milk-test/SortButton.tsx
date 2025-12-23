
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortConfig } from "@/hooks/useAggregatedResults";
import { useIsMobile } from "@/hooks/use-mobile";

interface SortButtonProps {
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onClearSort?: () => void;
}

export const SortButton = ({ sortConfig, onSort, onClearSort }: SortButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const sortOptions = [
    { key: 'avg_rating', label: 'Score' },
    { key: 'brand_name', label: 'Brand Name' },
    { key: 'product_name', label: 'Product Name' },
    { key: 'most_recent_date', label: 'Latest Test Date' },
    { key: 'count', label: 'Number of Tests' }
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
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg h-10 w-full justify-center"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort</span>
          {currentSort && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-secondary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`${isMobile ? 'w-48' : 'w-48'} p-4`} 
        align="end"
        side="bottom"
        sideOffset={8}
        alignOffset={0}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Sort by</h3>
            {currentSort && onClearSort && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClearSort();
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                onSort(option.key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                sortConfig.column === option.key 
                  ? 'bg-brand-secondary/10 text-brand-secondary font-medium' 
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
