import React, { useState } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SortConfig } from "@/hooks/useAggregatedResults";
import { ArrowUp, ArrowDown } from "lucide-react";

interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
}

interface MobileFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onClearSort?: () => void;
}

export const MobileFilterBar = ({
  searchTerm,
  setSearchTerm,
  filters,
  onFiltersChange,
  sortConfig,
  onSort,
  onClearSort
}: MobileFilterBarProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

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
      flavors: []
    });
    setIsFiltersOpen(false);
  };

  const activeFilterCount = 
    (filters.barista ? 1 : 0) + 
    filters.properties.length + 
    filters.flavors.length;

  const sortOptions = [
    { key: 'most_recent_date', label: 'Newest' },
    { key: 'avg_rating', label: 'Score' },
    { key: 'brand_name', label: 'Brand' },
    { key: 'product_name', label: 'Product' },
    { key: 'count', label: 'Tests' }
  ];

  const currentSort = sortOptions.find(option => option.key === sortConfig.column);
  const getSortIcon = () => {
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-3 w-3" />;
    }
    return <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11 bg-white border-gray-200"
          maxLength={100}
        />
      </div>

      {/* Filter Buttons Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Filters Button */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-shrink-0 h-10 px-4 bg-white border-gray-200 relative"
              style={activeFilterCount > 0 ? { 
                backgroundColor: '#2144ff',
                color: 'white',
                borderColor: '#2144ff'
              } : {}}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-white text-[#2144ff] rounded-full px-2 py-0.5 text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Barista Filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Type</h4>
                <Badge
                  variant="barista"
                  className={`cursor-pointer transition-all ${
                    filters.barista 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
                      : 'hover:bg-amber-50'
                  }`}
                  onClick={handleBaristaToggle}
                >
                  Barista
                </Badge>
              </div>

              {/* Properties Filter */}
              {properties.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {properties.map(property => (
                      <Badge
                        key={property.id}
                        variant="category"
                        className={`cursor-pointer transition-all ${
                          filters.properties.includes(property.key)
                            ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                            : 'hover:bg-slate-50'
                        }`}
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
                  <h4 className="text-sm font-medium mb-2">Flavors</h4>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map(flavor => (
                      <Badge
                        key={flavor.id}
                        variant="flavor"
                        className={`cursor-pointer transition-all ${
                          filters.flavors.includes(flavor.key)
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                            : 'hover:bg-purple-50'
                        }`}
                        onClick={() => handleFlavorToggle(flavor.key)}
                      >
                        {flavor.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Button */}
        <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-shrink-0 h-10 px-4 bg-white border-gray-200"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {currentSort?.label || 'Newest'}
              {sortConfig.column && (
                <span className="ml-1">
                  {getSortIcon()}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-4" align="start">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Sort by</h3>
                {currentSort && onClearSort && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearSort();
                      setIsSortOpen(false);
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
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                    sortConfig.column === option.key 
                      ? 'bg-[#2144ff]/10 text-[#2144ff] font-medium' 
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

        {/* Price Button - Coming Soon */}
        <Popover open={isPriceOpen} onOpenChange={setIsPriceOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-shrink-0 h-10 px-4 bg-white border-gray-200"
            >
              Price
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <div className="text-center text-sm text-muted-foreground">
              Price filtering coming soon!
            </div>
          </PopoverContent>
        </Popover>

        {/* Brand Button - Coming Soon */}
        <Popover open={isBrandOpen} onOpenChange={setIsBrandOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-shrink-0 h-10 px-4 bg-white border-gray-200"
            >
              Brand
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <div className="text-center text-sm text-muted-foreground">
              Brand filtering coming soon!
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
