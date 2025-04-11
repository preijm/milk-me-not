
import React from "react";
import { Badge } from "@/components/ui/badge";

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

interface ProductPropertyBadgesProps {
  propertyNames?: string[] | null;
  isBarista?: boolean;
  flavorNames?: string[] | null;
  className?: string;
  compact?: boolean;
  displayType?: 'all' | 'barista' | 'properties' | 'flavors';
  inline?: boolean; // New prop to enable inline display
}

export const ProductPropertyBadges: React.FC<ProductPropertyBadgesProps> = ({ 
  propertyNames, 
  isBarista,
  flavorNames,
  className = "",
  compact = false,
  displayType = 'all',
  inline = false // Default to false for backward compatibility
}) => {
  // Safety check
  if (!propertyNames && !isBarista && !flavorNames) {
    return null;
  }

  const badgeBaseClasses = compact 
    ? "text-xs px-2 py-0.5 font-medium" 
    : "rounded-full px-3 py-1 font-medium text-sm";
    
  const shouldRenderBarista = displayType === 'all' || displayType === 'barista';
  const shouldRenderProperties = displayType === 'all' || displayType === 'properties';
  const shouldRenderFlavors = displayType === 'all' || displayType === 'flavors';

  return (
    <div className={`flex flex-wrap gap-1 ${inline ? "inline-flex ml-2" : ""} ${compact ? "inline-flex" : ""} ${className}`}>
      {/* Barista badge with priority styling */}
      {shouldRenderBarista && isBarista && (
        <Badge 
          variant="outline" 
          className={`${badgeBaseClasses} bg-cream-300 border-cream-400 text-milk-600`}
        >
          Barista
        </Badge>
      )}
      
      {/* Property badges */}
      {shouldRenderProperties && propertyNames && propertyNames.map((property, index) => (
        <Badge 
          key={`property-${index}`} 
          variant="outline" 
          className={`${badgeBaseClasses} bg-gray-100 border-gray-200 text-gray-700`}
        >
          {formatDisplayName(property)}
        </Badge>
      ))}
      
      {/* Flavor badges */}
      {shouldRenderFlavors && flavorNames && flavorNames.map((flavor, index) => (
        <Badge 
          key={`flavor-${index}`} 
          variant="outline" 
          className={`${badgeBaseClasses} bg-blue-100 border-blue-200 text-blue-700`}
        >
          {formatDisplayName(flavor)}
        </Badge>
      ))}
    </div>
  );
};
