import React, { useState } from "react";
import { Search, SlidersHorizontal, User, X, ArrowUpDown, Check, Coffee, Droplet, Tag, Calendar, Star, Building2, Package, Hash } from "lucide-react";
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

// Sort categories with their options grouped
const sortCategories = [
  {
    icon: Calendar,
    label: 'Date',
    options: [
      { key: 'most_recent_date', direction: 'desc' as const, label: 'Newest', fullLabel: 'Newest' },
      { key: 'most_recent_date', direction: 'asc' as const, label: 'Oldest', fullLabel: 'Oldest' },
    ]
  },
  {
    icon: Star,
    label: 'Score',
    options: [
      { key: 'avg_rating', direction: 'desc' as const, label: 'Highest', fullLabel: 'Highest' },
      { key: 'avg_rating', direction: 'asc' as const, label: 'Lowest', fullLabel: 'Lowest' },
    ]
  },
  {
    icon: Building2,
    label: 'Brand',
    options: [
      { key: 'brand_name', direction: 'asc' as const, label: 'A-Z', fullLabel: 'A-Z' },
      { key: 'brand_name', direction: 'desc' as const, label: 'Z-A', fullLabel: 'Z-A' },
    ]
  },
  {
    icon: Package,
    label: 'Product',
    options: [
      { key: 'product_name', direction: 'asc' as const, label: 'A-Z', fullLabel: 'A-Z' },
      { key: 'product_name', direction: 'desc' as const, label: 'Z-A', fullLabel: 'Z-A' },
    ]
  },
  {
    icon: Hash,
    label: 'Tests',
    options: [
      { key: 'count', direction: 'desc' as const, label: 'Most', fullLabel: 'Most' },
      { key: 'count', direction: 'asc' as const, label: 'Fewest', fullLabel: 'Fewest' },
    ]
  },
];

// Flatten for label lookup
const sortOptions = sortCategories.flatMap(cat => 
  cat.options.map(opt => ({ ...opt, categoryLabel: cat.label }))
);

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
    if (current) {
      return `${current.categoryLabel}: ${current.label}`;
    }
    return 'Sort';
  };

  const getPropertyName = (key: string) => {
    return properties.find(p => p.key === key)?.name || key;
  };

  const getFlavorName = (key: string) => {
    return flavors.find(f => f.key === key)?.name || key;
  };

  return (
    <div className="space-y-2">
      {/* Search Bar - Full Width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-10 bg-background border-border rounded-lg w-full text-sm"
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
              className="h-9 flex-1 flex items-center justify-center gap-1.5 rounded-lg transition-colors min-w-0"
            >
              <ArrowUpDown className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{getCurrentSortLabel()}</span>
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
            <div className="px-4 pb-4 overflow-y-auto space-y-2">
              {sortCategories.map((category) => {
                const Icon = category.icon;
                
                return (
                  <div key={category.label} className="flex items-center gap-3">
                    {/* Category label with icon */}
                    <div className="flex items-center gap-2 w-24 flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{category.label}</span>
                    </div>
                    
                    {/* Two sort direction buttons */}
                    <div className="flex gap-2 flex-1">
                      {category.options.map((option) => {
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
                              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                              isActive 
                                ? "bg-[#2144ff] text-white font-medium" 
                                : "bg-muted/50 hover:bg-muted text-foreground"
                            )}
                          >
                            <span>{option.label}</span>
                            {isActive && (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
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
                "h-9 flex-1 flex items-center justify-center gap-1.5 rounded-lg transition-colors min-w-0",
                activeFilterCount > 0 && "bg-[#2144ff] text-white border-[#2144ff] hover:bg-[#2144ff]/90 hover:text-white hover:border-[#2144ff]/90"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium">Filter</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex flex-row items-center justify-between pb-2">
              <DrawerTitle>Filter by</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
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
              "h-9 flex-1 flex items-center justify-center gap-1.5 rounded-lg transition-colors min-w-0",
              filters.myResultsOnly && "bg-brand-secondary text-white border-brand-secondary hover:bg-brand-secondary/90"
            )}
          >
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs font-medium whitespace-nowrap">My Results</span>
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-muted-foreground">
        {resultsCount} products
      </div>
    </div>
  );
};
