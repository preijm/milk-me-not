
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Coffee, Tag, Droplet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Helper function to format keys like "pumpkin_spice" to "Pumpkin Spice"
// and "three_point_five_percent" to "3.5%"
const formatDisplayName = (key: string): string => {
  // Special case for percentage values
  if (key.includes('point') && key.includes('percent')) {
    return key.replace(/_point_/g, '.')
              .replace(/_percent/g, '%')
              .replace(/one/g, '1')
              .replace(/two/g, '2')
              .replace(/three/g, '3')
              .replace(/four/g, '4')
              .replace(/five/g, '5')
              .replace(/six/g, '6')
              .replace(/seven/g, '7')
              .replace(/eight/g, '8')
              .replace(/nine/g, '9')
              .replace(/zero/g, '0');
  }
  
  // Regular formatting for other keys: capitalize each word and replace underscores with spaces
  return key.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
}

interface ProductPropertyBadgesProps {
  propertyNames?: string[] | null;
  isBarista?: boolean;
  flavorNames?: string[] | null;
  className?: string;
  compact?: boolean;
  displayType?: 'all' | 'barista' | 'properties' | 'flavors';
  inline?: boolean; // Prop to enable inline display
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
}

export const ProductPropertyBadges: React.FC<ProductPropertyBadgesProps> = ({ 
  propertyNames, 
  isBarista,
  flavorNames,
  className = "",
  compact = false,
  displayType = 'all',
  inline = false, // Default to false for backward compatibility
  filters,
  onFiltersChange
}) => {
  // Fetch properties and flavors to create name-to-key mapping for badge clicks
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*').order('ordering', { ascending: true });
      return data || [];
    },
    enabled: !!(filters && onFiltersChange) // Only fetch if filtering is enabled
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const { data } = await supabase.from('flavors').select('*').order('ordering', { ascending: true });
      return data || [];
    },
    enabled: !!(filters && onFiltersChange) // Only fetch if filtering is enabled
  });

  // Create mappings from names to keys for badge clicks
  const propertyNameToKey = new Map(properties.map(p => [p.name, p.key]));
  const flavorNameToKey = new Map(flavors.map(f => [f.name, f.key]));

  // Safety check
  if (!propertyNames && !isBarista && !flavorNames) {
    return null;
  }

  // Use consistent badge sizing regardless of compact mode
  const badgeBaseClasses = "text-xs px-2 py-0.5 font-medium";
    
  const shouldRenderBarista = displayType === 'all' || displayType === 'barista';
  const shouldRenderProperties = displayType === 'all' || displayType === 'properties';
  const shouldRenderFlavors = displayType === 'all' || displayType === 'flavors';

  const handleBaristaClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    console.log('Barista badge clicked, current filter:', filters?.barista);
    if (filters && onFiltersChange) {
      onFiltersChange({
        ...filters,
        barista: !filters.barista
      });
    }
  };

  const handlePropertyClick = (propertyName: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const propertyKey = propertyNameToKey.get(propertyName);
    console.log('Property badge clicked:', propertyName, 'converted to key:', propertyKey, 'current filters:', filters?.properties);
    if (filters && onFiltersChange && propertyKey) {
      const newProperties = filters.properties.includes(propertyKey)
        ? filters.properties.filter(p => p !== propertyKey)
        : [...filters.properties, propertyKey];
      
      onFiltersChange({
        ...filters,
        properties: newProperties
      });
    }
  };

  const handleFlavorClick = (flavorName: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const flavorKey = flavorNameToKey.get(flavorName);
    console.log('Flavor badge clicked:', flavorName, 'converted to key:', flavorKey, 'current filters:', filters?.flavors);
    if (filters && onFiltersChange && flavorKey) {
      const newFlavors = filters.flavors.includes(flavorKey)
        ? filters.flavors.filter(f => f !== flavorKey)
        : [...filters.flavors, flavorKey];
      
      onFiltersChange({
        ...filters,
        flavors: newFlavors
      });
    }
  };

  // Updated to ensure consistent spacing with a fixed gap value
  return (
    <div className={`flex flex-wrap gap-2 ${inline ? "inline-flex" : ""} ${compact ? "inline-flex" : ""} ${className}`}>
      {/* Barista badge with priority styling */}
      {shouldRenderBarista && isBarista && (
        <Badge 
          variant="barista"
          className={`${filters && onFiltersChange ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default hover:shadow-none'} ${
            filters?.barista ? 'bg-amber-600 text-white border-amber-600 shadow-md' : ''
          }`}
          onClick={filters && onFiltersChange ? handleBaristaClick : undefined}
        >
          <Coffee className="w-3 h-3 mr-1" />
          Barista
        </Badge>
      )}
      
      {/* Property badges */}
      {shouldRenderProperties && propertyNames && propertyNames.map((property, index) => {
        const propertyKey = propertyNameToKey.get(property);
        return (
          <Badge 
            key={`property-${index}`} 
            variant="category"
            className={`${filters && onFiltersChange ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default hover:shadow-none'} ${
              propertyKey && filters?.properties.includes(propertyKey) ? 'bg-slate-600 text-white border-slate-600 shadow-md' : ''
            }`}
            onClick={filters && onFiltersChange ? handlePropertyClick(property) : undefined}
          >
            <Tag className="w-3 h-3 mr-1" />
            {formatDisplayName(property)}
          </Badge>
        );
      })}
      
      {/* Flavor badges */}
      {shouldRenderFlavors && flavorNames && flavorNames.map((flavor, index) => {
        const flavorKey = flavorNameToKey.get(flavor);
        return (
          <Badge 
            key={`flavor-${index}`} 
            variant="flavor"
            className={`${filters && onFiltersChange ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-default hover:shadow-none'} ${
              flavorKey && filters?.flavors.includes(flavorKey) ? 'bg-purple-600 text-white border-purple-600 shadow-md' : ''
            }`}
            onClick={filters && onFiltersChange ? handleFlavorClick(flavor) : undefined}
          >
            <Droplet className="w-3 h-3 mr-1" />
            {formatDisplayName(flavor)}
          </Badge>
        );
      })}
    </div>
  );
};
