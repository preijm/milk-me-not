
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FlavorSelectorProps {
  flavors: Array<{ id: string; name: string; key: string }>;
  selectedFlavors: string[];
  onFlavorToggle: (flavorKey: string) => void;
  onAddNewFlavor?: () => void;
}

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

export const FlavorSelector = ({ 
  flavors, 
  selectedFlavors, 
  onFlavorToggle,
  onAddNewFlavor 
}: FlavorSelectorProps) => {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {flavors.map(flavor => (
          <Badge 
            key={flavor.id} 
            variant="outline" 
            className={`
              rounded-full px-4 py-1 cursor-pointer transition-all 
              ${selectedFlavors.includes(flavor.key) 
                ? 'bg-blue-500 text-white border-blue-600 font-medium shadow-sm hover:bg-blue-600' 
                : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'}
            `} 
            onClick={() => onFlavorToggle(flavor.key)}
          >
            {/* Use the flavor name from the API or format the key as a fallback */}
            {flavor.name || formatDisplayName(flavor.key)}
          </Badge>
        ))}
        
        {/* Add New Flavor button with only plus icon */}
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 h-8 w-8 p-0"
          onClick={onAddNewFlavor}
          aria-label="Add new flavor"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};
