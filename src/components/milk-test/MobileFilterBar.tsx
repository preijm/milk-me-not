import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, User, ArrowUpDown, X, ArrowUp, ArrowDown, Star, Calendar, Tag, Package, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SortConfig } from "@/hooks/useAggregatedResults";
import { useAuth } from "@/contexts/AuthContext";

interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
  myResultsOnly: boolean;
}

interface MobileFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onSetSort?: (column: string, direction: 'asc' | 'desc') => void;
  onClearSort?: () => void;
  resultsCount: number;
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

export const MobileFilterBar = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  sortConfig,
  onSort,
  onSetSort,
  onClearSort,
  resultsCount
}: MobileFilterBarProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);
  const [pendingDirections, setPendingDirections] = useState<Record<string, 'asc' | 'desc'>>({});
  const { user } = useAuth();

  const handleMyResultsToggle = () => {
    onFiltersChange({
      ...filters,
      myResultsOnly: !filters.myResultsOnly
    });
  };

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*').order('ordering', { ascending: true });
      return data || [];
    }
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const { data } = await supabase.from('flavors').select('*').order('ordering', { ascending: true });
      return data || [];
    }
  });

  const handleSearchChange = (value: string) => {
    const sanitized = value
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');

    if (sanitized.length <= 100) {
      setSearchTerm(sanitized);
    }
  };

  const handleBaristaToggle = () => {
    onFiltersChange({
      ...filters,
      barista: !filters.barista
    });
  };

  const handlePropertyToggle = (propertyKey: string) => {
    const newProperties = filters.properties.includes(propertyKey)
      ? filters.properties.filter(p => p !== propertyKey)
      : [...filters.properties, propertyKey];
    
    onFiltersChange({
      ...filters,
      properties: newProperties
    });
  };

  const handleFlavorToggle = (flavorKey: string) => {
    const newFlavors = filters.flavors.includes(flavorKey)
      ? filters.flavors.filter(f => f !== flavorKey)
      : [...filters.flavors, flavorKey];
    
    onFiltersChange({
      ...filters,
      flavors: newFlavors
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      barista: false,
      properties: [],
      flavors: [],
      myResultsOnly: false
    });
  };

  const clearTypeFilters = () => {
    onFiltersChange({
      ...filters,
      barista: false
    });
  };

  const clearPropertyFilters = () => {
    onFiltersChange({
      ...filters,
      properties: []
    });
  };

  const clearFlavorFilters = () => {
    onFiltersChange({
      ...filters,
      flavors: []
    });
  };

  const handleRemoveFilter = (type: 'barista' | 'property' | 'flavor', value?: string) => {
    if (type === 'barista') {
      onFiltersChange({ ...filters, barista: false });
    } else if (type === 'property' && value) {
      onFiltersChange({
        ...filters,
        properties: filters.properties.filter(p => p !== value)
      });
    } else if (type === 'flavor' && value) {
      onFiltersChange({
        ...filters,
        flavors: filters.flavors.filter(f => f !== value)
      });
    }
  };

  const activeFilterCount = 
    (filters.barista ? 1 : 0) + 
    filters.properties.length + 
    filters.flavors.length;

  const sortOptions = [
    { key: 'avg_rating', label: 'Score', icon: Star },
    { key: 'most_recent_date', label: 'Date', icon: Calendar },
    { key: 'brand_name', label: 'Brand', icon: Tag },
    { key: 'product_name', label: 'Product', icon: Package },
    { key: 'count', label: 'Tests', icon: Trophy }
  ];

  const currentSort = sortOptions.find(option => option.key === sortConfig.column);

  const getPropertyName = (key: string) => {
    return properties.find(p => p.key === key)?.name || key;
  };

  const getFlavorName = (key: string) => {
    return flavors.find(f => f.key === key)?.name || key;
  };

  return (
    <div className="space-y-3">
      {/* Search Bar - Full Width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11 bg-background border-border rounded-lg w-full"
          maxLength={100}
        />
      </div>

      {/* Action Buttons Row - Equal width buttons */}
      <div className="flex items-center gap-2">
        {/* Sort Button */}
        <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-11 flex-1 flex items-center justify-center gap-2 rounded-lg bg-background border-border min-w-0"
            >
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{currentSort?.label || 'Sort'}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>Sort by</DrawerTitle>
              {onClearSort && sortConfig.column !== 'avg_rating' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearSort();
                    setPendingDirections({});
                  }}
                  className="text-primary font-medium h-auto p-0"
                >
                  Clear
                </Button>
              )}
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-3">
              {sortOptions.map((option) => {
                const isActive = sortConfig.column === option.key;
                const Icon = option.icon;
                
                // Get the effective direction for this option
                const getDirection = (): 'asc' | 'desc' => {
                  if (isActive) return sortConfig.direction;
                  if (pendingDirections[option.key]) return pendingDirections[option.key];
                  return defaultDirections[option.key] || 'desc';
                };
                
                const direction = getDirection();
                const dirLabel = directionLabels[option.key];
                
                // Toggle direction for an option
                const toggleDirection = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const newDir = direction === 'asc' ? 'desc' : 'asc';
                  setAnimatingKey(option.key);
                  
                  if (isActive && onSetSort) {
                    // If active, apply immediately
                    onSetSort(option.key, newDir);
                  } else {
                    // Otherwise update pending state
                    setPendingDirections(prev => ({ ...prev, [option.key]: newDir }));
                  }
                  
                  setTimeout(() => setAnimatingKey(null), 300);
                };
                
                // Apply sort with current direction
                const applySort = () => {
                  if (onSetSort) {
                    onSetSort(option.key, direction);
                  } else {
                    onSort(option.key);
                  }
                  setIsSortOpen(false);
                };
                
                return (
                  <div
                    key={option.key}
                    className={cn(
                      "flex items-center justify-between h-16 px-4 rounded-xl border-2 transition-all",
                      isActive 
                        ? "bg-brand-secondary/5 border-brand-secondary" 
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {/* Main clickable area - applies sort */}
                    <button
                      onClick={applySort}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isActive ? "bg-brand-secondary/10" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-brand-secondary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "text-base font-medium",
                        isActive && "text-brand-secondary"
                      )}>
                        {option.label}
                      </span>
                    </button>
                    
                    {/* Direction toggle button - always visible */}
                    <Button
                      size="sm"
                      className={cn(
                        "h-9 px-4 gap-2 rounded-lg",
                        isActive 
                          ? "bg-brand-secondary hover:bg-brand-secondary/90 text-white" 
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                      onClick={toggleDirection}
                    >
                      <span className={cn(
                        "transition-transform duration-300",
                        animatingKey === option.key && "animate-flip-up"
                      )}>
                        {direction === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </span>
                      <span className="text-sm font-medium">
                        {direction === 'asc' ? dirLabel.asc : dirLabel.desc}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Filters Button */}
        <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-11 flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors min-w-0",
                activeFilterCount > 0 && "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))] hover:bg-[hsl(var(--filter-active))]/90"
              )}
            >
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Filter</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex flex-row items-center justify-between">
              <DrawerTitle>
                Filter by
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 px-1.5 text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </DrawerTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-primary font-medium h-auto p-0"
                >
                  Clear All
                </Button>
              )}
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto space-y-6">
              {/* Type Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">Type</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="barista"
                    className={cn(
                      "cursor-pointer transition-all px-3 py-1.5 text-sm font-medium",
                      filters.barista &&
                        "bg-amber-600 text-white border-amber-600"
                    )}
                    onClick={handleBaristaToggle}
                  >
                    Barista
                  </Badge>
                </div>
              </div>

              {/* Properties Section */}
              {properties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {properties.map(property => (
                      <Badge
                        key={property.id}
                        variant="category"
                        className={cn(
                          "cursor-pointer transition-all px-3 py-1.5 text-sm font-medium",
                          filters.properties.includes(property.key) &&
                            "bg-slate-600 text-white border-slate-600"
                        )}
                        onClick={() => handlePropertyToggle(property.key)}
                      >
                        {property.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavors Section */}
              {flavors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Flavors</h4>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map(flavor => (
                      <Badge
                        key={flavor.id}
                        variant="flavor"
                        className={cn(
                          "cursor-pointer transition-all px-3 py-1.5 text-sm font-medium",
                          filters.flavors.includes(flavor.key) &&
                            "bg-purple-600 text-white border-purple-600"
                        )}
                        onClick={() => handleFlavorToggle(flavor.key)}
                      >
                        {flavor.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <DrawerFooter className="border-t">
              <Button
                onClick={() => setIsFiltersOpen(false)}
                className="w-full h-12 text-white bg-brand-secondary hover:bg-brand-secondary/90"
              >
                Show {resultsCount} Results
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* My Results Button */}
        {user && (
          <Button
            variant="outline"
            onClick={handleMyResultsToggle}
            className={cn(
              "h-11 flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors min-w-0",
              filters.myResultsOnly && "bg-brand-secondary text-white border-brand-secondary hover:bg-brand-secondary/90"
            )}
          >
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium whitespace-nowrap">My Results</span>
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {resultsCount} products
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.barista && (
            <Badge
              variant="barista"
              className="px-3 py-1.5 flex items-center gap-1"
            >
              Barista
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveFilter('barista')}
              />
            </Badge>
          )}
          {filters.properties.map(propKey => (
            <Badge
              key={propKey}
              variant="category"
              className="px-3 py-1.5 flex items-center gap-1"
            >
              {getPropertyName(propKey)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveFilter('property', propKey)}
              />
            </Badge>
          ))}
          {filters.flavors.map(flavorKey => (
            <Badge
              key={flavorKey}
              variant="flavor"
              className="px-3 py-1.5 flex items-center gap-1"
            >
              {getFlavorName(flavorKey)}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveFilter('flavor', flavorKey)}
              />
            </Badge>
          ))}
        </div>
      )}

    </div>
  );
};
