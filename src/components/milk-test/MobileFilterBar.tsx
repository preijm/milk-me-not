import React, { useState } from "react";
import { Search, SlidersHorizontal, User, X, ArrowUpDown, Check, Coffee, Droplet, Tag } from "lucide-react";
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

// Explicit sort options with field + direction combined
const sortOptions = [
  { key: 'most_recent_date', direction: 'desc' as const, label: 'Date: Newest First' },
  { key: 'most_recent_date', direction: 'asc' as const, label: 'Date: Oldest First' },
  { key: 'avg_rating', direction: 'desc' as const, label: 'Score: Highest First' },
  { key: 'avg_rating', direction: 'asc' as const, label: 'Score: Lowest First' },
  { key: 'brand_name', direction: 'asc' as const, label: 'Brand: A-Z' },
  { key: 'brand_name', direction: 'desc' as const, label: 'Brand: Z-A' },
  { key: 'product_name', direction: 'asc' as const, label: 'Product: A-Z' },
  { key: 'product_name', direction: 'desc' as const, label: 'Product: Z-A' },
  { key: 'count', direction: 'desc' as const, label: 'Tests: Most First' },
  { key: 'count', direction: 'asc' as const, label: 'Tests: Fewest First' },
];

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

  // Get the current sort label for the button
  const getCurrentSortLabel = () => {
    const current = sortOptions.find(
      opt => opt.key === sortConfig.column && opt.direction === sortConfig.direction
    );
    return current?.label || 'Sort';
  };

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

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Sort Button with Drawer */}
        <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-11 flex-1 flex items-center justify-center gap-2 rounded-lg transition-colors min-w-0"
            >
              <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{getCurrentSortLabel()}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex flex-row items-center justify-between pb-2">
              <DrawerTitle>Sort by</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-0 pb-4 overflow-y-auto">
              {sortOptions.map((option) => {
                const isActive = sortConfig.column === option.key && sortConfig.direction === option.direction;
                
                return (
                  <button
                    key={`${option.key}-${option.direction}`}
                    onClick={() => {
                      if (onSetSort) {
                        onSetSort(option.key, option.direction);
                      }
                      setIsSortOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "text-base",
                      isActive && "font-medium"
                    )}>
                      {option.label}
                    </span>
                    {isActive && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
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
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  Type
                </h4>
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
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-600" />
                    Properties
                  </h4>
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
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-purple-600" />
                    Flavors
                  </h4>
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
