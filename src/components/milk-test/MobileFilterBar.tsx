import React, { useState } from "react";
import { Search, SlidersHorizontal, User, ArrowUpDown, X, ArrowUp, ArrowDown } from "lucide-react";
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
  onClearSort?: () => void;
  resultsCount: number;
}

export const MobileFilterBar = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  sortConfig,
  onSort,
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

  const sortOptions = [
    { key: 'avg_rating', label: 'Score' },
    { key: 'most_recent_date', label: 'Newest' },
    { key: 'brand_name', label: 'Brand' },
    { key: 'product_name', label: 'Product' },
    { key: 'count', label: 'Tests' }
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

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Sort Button */}
        <Drawer open={isSortOpen} onOpenChange={setIsSortOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-background border-border"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-sm font-medium">{currentSort?.label || 'Sort'}</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Sort by</DrawerTitle>
              <DrawerDescription>Choose how to sort the products</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-2">
              {sortOptions.map((option) => {
                const isActive = sortConfig.column === option.key;
                return (
                  <Button
                    key={option.key}
                    variant={isActive ? "default" : "outline"}
                    className="w-full justify-between h-12"
                    onClick={() => {
                      onSort(option.key);
                      setIsSortOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {isActive && (
                      sortConfig.direction === 'asc' 
                        ? <ArrowUp className="h-4 w-4" />
                        : <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                );
              })}
            </div>
            {onClearSort && sortConfig.column !== 'avgRating' && (
              <DrawerFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearSort();
                    setIsSortOpen(false);
                  }}
                >
                  Clear Sort
                </Button>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>

        {/* Filters Button */}
        <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 h-11 flex items-center justify-center gap-2 rounded-lg transition-colors",
                activeFilterCount > 0 && "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))] hover:bg-[hsl(var(--filter-active))]/90"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filter</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-white text-[hsl(var(--filter-active))] rounded-full min-w-[20px] h-5 px-1.5 text-xs font-semibold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Filter products by type, properties, and flavors</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto space-y-4">
              {/* Barista Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Type</h4>
                  {filters.barista && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTypeFilters}
                      className="text-xs h-auto py-1 text-[hsl(var(--filter-active))]"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Badge
                  variant="barista"
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.barista
                      ? "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))] shadow-md"
                      : "hover:bg-amber-50"
                  )}
                  onClick={handleBaristaToggle}
                >
                  Barista
                </Badge>
              </div>

              {/* Properties Filter */}
              {properties.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Properties</h4>
                    {filters.properties.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearPropertyFilters}
                        className="text-xs h-auto py-1 text-[hsl(var(--filter-active))]"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {properties.map(property => (
                      <Badge
                      key={property.id}
                      variant="category"
                      className={cn(
                        "cursor-pointer transition-all",
                        filters.properties.includes(property.key)
                          ? "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))]"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                      onClick={() => handlePropertyToggle(property.key)}
                      >
                        {property.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavors Filter */}
              {flavors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Flavors</h4>
                    {filters.flavors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFlavorFilters}
                        className="text-xs h-auto py-1 text-[hsl(var(--filter-active))]"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map(flavor => (
                      <Badge
                      key={flavor.id}
                      variant="flavor"
                      className={cn(
                        "cursor-pointer transition-all",
                        filters.flavors.includes(flavor.key)
                          ? "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))]"
                          : "bg-background text-foreground border-border hover:bg-muted"
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
                className="w-full"
              >
                Show {resultsCount} Results
              </Button>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
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
              "flex-1 h-11 flex items-center justify-center gap-2 rounded-lg transition-colors",
              filters.myResultsOnly && "bg-[hsl(var(--filter-active))] text-white border-[hsl(var(--filter-active))] hover:bg-[hsl(var(--filter-active))]/90"
            )}
          >
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">My Results</span>
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
