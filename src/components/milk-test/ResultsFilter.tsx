
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Coffee, Tag, Droplet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
  myResultsOnly: boolean;
}

interface ResultsFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const ResultsFilter = ({
  filters,
  onFiltersChange
}: ResultsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const {
    data: properties = []
  } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('properties').select('*').order('ordering', {
        ascending: true
      });
      return data || [];
    }
  });
  const {
    data: flavors = []
  } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const {
        data
      } = await supabase.from('flavors').select('*').order('ordering', {
        ascending: true
      });
      return data || [];
    }
  });

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

  const handleMyResultsToggle = () => {
    onFiltersChange({
      ...filters,
      myResultsOnly: !filters.myResultsOnly
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

  const hasActiveFilters = filters.barista || filters.properties.length > 0 || filters.flavors.length > 0 || filters.myResultsOnly;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg h-10 w-full justify-center"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-secondary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={`${isMobile ? 'w-60' : 'w-64'} p-4`} 
          align={isMobile ? "center" : "end"}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Show Me Only...</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* My Results Only - Only visible when logged in */}
            {user && (
              <div className="flex items-center space-x-2 pb-3 border-b">
                <Checkbox
                  id="myResults"
                  checked={filters.myResultsOnly}
                  onCheckedChange={handleMyResultsToggle}
                />
                <label
                  htmlFor="myResults"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  My results only
                </label>
              </div>
            )}

            {/* Barista Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                Type
              </h4>
              <Badge
                variant="barista"
                className={`cursor-pointer transition-all ${
                  filters.barista 
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md hover:bg-amber-700 hover:text-white' 
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
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-600" />
                  Properties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {properties.map(property => (
                    <Badge
                      key={property.id}
                      variant="category"
                    className={`cursor-pointer transition-all ${
                      filters.properties.includes(property.key)
                        ? 'bg-slate-600 text-white border-slate-600 shadow-md hover:bg-slate-700 hover:text-white'
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
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-purple-600" />
                  Flavors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flavors.map(flavor => (
                    <Badge
                      key={flavor.id}
                      variant="flavor"
                    className={`cursor-pointer transition-all ${
                      filters.flavors.includes(flavor.key)
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md hover:bg-purple-700 hover:text-white'
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
  );
};
