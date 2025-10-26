import React, { useState } from "react";
import { Search, SlidersHorizontal, User, Star, ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      return <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-11 h-12 bg-background border-border text-base"
          maxLength={100}
        />
      </div>

      {/* Three Button Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* My Results Button */}
        {user && (
          <Button
            variant="outline"
            onClick={handleMyResultsToggle}
            className={`h-12 flex items-center justify-center gap-2 transition-colors ${
              filters.myResultsOnly
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">My Results</span>
          </Button>
        )}

        {/* Score Sort Button */}
        <Button
          variant="outline"
          onClick={() => onSort('avg_rating')}
          className={`h-12 flex items-center justify-center gap-2 ${
            sortConfig.column === 'avg_rating'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border'
          }`}
        >
          <Star className="h-5 w-5" />
          <span className="text-sm font-medium">Score</span>
          {sortConfig.column === 'avg_rating' && (
            <span className="ml-1">
              {getSortIcon()}
            </span>
          )}
        </Button>

        {/* Filters Button */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-12 flex items-center justify-center gap-2 relative ${
                activeFilterCount > 0
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-background text-primary rounded-full px-1.5 py-0.5 text-xs font-semibold min-w-[20px] text-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="end">
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
      </div>
    </div>
  );
};
