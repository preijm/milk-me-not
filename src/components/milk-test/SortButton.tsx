
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, ArrowUp, ArrowDown, Star, Calendar, Tag, Package, Trophy } from "lucide-react";
import { SortConfig } from "@/hooks/useAggregatedResults";
import { useIsMobile } from "@/hooks/use-mobile";

interface SortButtonProps {
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onClearSort?: () => void;
  onSetSort?: (column: string, direction: 'asc' | 'desc') => void;
}

// Store default directions for each column (what makes most sense as default)
const defaultDirections: Record<string, 'asc' | 'desc'> = {
  'avg_rating': 'desc',      // High scores first
  'brand_name': 'asc',       // A-Z
  'product_name': 'asc',     // A-Z
  'most_recent_date': 'desc', // Newest first
  'count': 'desc'            // Most tests first
};

// Direction labels for each column
const directionLabels: Record<string, { asc: string; desc: string }> = {
  'avg_rating': { asc: 'Low', desc: 'High' },
  'brand_name': { asc: 'A-Z', desc: 'Z-A' },
  'product_name': { asc: 'A-Z', desc: 'Z-A' },
  'most_recent_date': { asc: 'Old', desc: 'New' },
  'count': { asc: 'Few', desc: 'Many' }
};

export const SortButton = ({ sortConfig, onSort, onClearSort, onSetSort }: SortButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Track pending directions for each option (before selecting)
  const [pendingDirections, setPendingDirections] = useState<Record<string, 'asc' | 'desc'>>({});
  const isMobile = useIsMobile();

  const sortOptions = [
    { key: 'avg_rating', label: 'Score', icon: Star },
    { key: 'most_recent_date', label: 'Date', icon: Calendar },
    { key: 'brand_name', label: 'Brand', icon: Tag },
    { key: 'product_name', label: 'Product', icon: Package },
    { key: 'count', label: 'Tests', icon: Trophy }
  ];

  const currentSort = sortOptions.find(option => option.key === sortConfig.column);

  // Get the effective direction for an option
  const getDirection = (key: string): 'asc' | 'desc' => {
    // If this is the currently sorted column, use that direction
    if (sortConfig.column === key) {
      return sortConfig.direction;
    }
    // If user has toggled this option's direction, use that
    if (pendingDirections[key]) {
      return pendingDirections[key];
    }
    // Otherwise use default
    return defaultDirections[key] || 'desc';
  };

  // Toggle direction for an option
  const toggleDirection = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentDir = getDirection(key);
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
    
    // If this is the active sort, apply immediately
    if (sortConfig.column === key && onSetSort) {
      onSetSort(key, newDir);
    } else {
      // Otherwise just update pending state
      setPendingDirections(prev => ({ ...prev, [key]: newDir }));
    }
  };

  // Apply sort with the current direction for that option
  const applySort = (key: string) => {
    const direction = getDirection(key);
    if (onSetSort) {
      onSetSort(key, direction);
    } else {
      onSort(key);
    }
    setIsOpen(false);
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
        className={`${isMobile ? 'w-72' : 'w-72'} p-4`} 
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
                  setPendingDirections({});
                  setIsOpen(false);
                }}
                className="text-xs text-brand-secondary hover:text-brand-secondary"
              >
                Clear
              </Button>
            )}
          </div>
          {sortOptions.map((option) => {
            const isActive = sortConfig.column === option.key;
            const direction = getDirection(option.key);
            const Icon = option.icon;
            const dirLabel = directionLabels[option.key];
            
            return (
              <div
                key={option.key}
                className={`flex items-center gap-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-brand-secondary/10 border-2 border-brand-secondary' 
                    : 'border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Main clickable area - applies sort */}
                <button
                  onClick={() => applySort(option.key)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 text-left ${
                    isActive ? 'text-brand-secondary font-medium' : 'text-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${isActive ? 'bg-brand-secondary/20' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-brand-secondary' : 'text-muted-foreground'}`} />
                  </div>
                  <span>{option.label}</span>
                </button>
                
                {/* Direction toggle button */}
                <button
                  onClick={(e) => toggleDirection(option.key, e)}
                  className={`flex items-center gap-1 px-3 py-1.5 mr-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-secondary text-white hover:bg-brand-secondary/90' 
                      : 'bg-gray-100 text-muted-foreground hover:bg-gray-200'
                  }`}
                >
                  {direction === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                  <span>{direction === 'asc' ? dirLabel.asc : dirLabel.desc}</span>
                </button>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
