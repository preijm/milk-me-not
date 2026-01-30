import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FlavorSelectorProps {
  flavors: Array<{ id: string; name: string; key: string }>;
  selectedFlavors: string[];
  onFlavorToggle: (flavorKey: string) => void;
  onAddNewFlavor?: () => void;
  refetchFlavors?: () => void;
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
  onAddNewFlavor,
  refetchFlavors
}: FlavorSelectorProps) => {
  const [newFlavorName, setNewFlavorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const createFlavorKey = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const handleAddFlavor = async () => {
    if (!newFlavorName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const key = createFlavorKey(newFlavorName);
    
    try {
      // Check if flavor with this key already exists
      const { data: existingFlavors } = await supabase
        .from('flavors')
        .select('key')
        .eq('key', key);
      
      if (existingFlavors && existingFlavors.length > 0) {
        console.log('Flavor already exists');
        setIsSubmitting(false);
        return;
      }
      
      // Add new flavor to database - now available to all users
      const { error } = await supabase
        .from('flavors')
        .insert({
          name: newFlavorName.trim(),
          key: key,
          ordering: 999 // Default ordering
        });
      
      if (error) {
        console.error('Error adding flavor:', error);
      } else {
        console.log('New flavor added successfully');
        setNewFlavorName("");
        setShowAddInput(false);
        // Refetch flavors to show the new addition immediately
        if (refetchFlavors) {
          refetchFlavors();
        }
        if (onAddNewFlavor) {
          onAddNewFlavor();
        }
      }
    } catch (error) {
      console.error('Error adding flavor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddInput(false);
    setNewFlavorName("");
  };

  return (
    <div>
      {/* Flavors list with plus button inline */}
      <div className="flex flex-wrap gap-3.5">
        {flavors.map(flavor => (
          <Badge 
            key={flavor.id} 
            variant="flavor" 
            className={`cursor-pointer transition-all h-7 flex items-center ${
              selectedFlavors.includes(flavor.key) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : ''
            }`}
            onClick={() => onFlavorToggle(flavor.key)}
          >
            {/* Use the flavor name from the API or format the key as a fallback */}
            {flavor.name || formatDisplayName(flavor.key)}
          </Badge>
        ))}
        
        {!showAddInput ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 rounded-full"
            aria-label="Add new flavor"
            onClick={() => setShowAddInput(true)}
          >
            <Plus size={16} />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={newFlavorName}
              onChange={(e) => setNewFlavorName(e.target.value)}
              placeholder="Flavor name"
              className="h-7 w-40 text-sm"
              autoFocus
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFlavor();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel"
            >
              <X size={14} />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="brand"
              className="h-7 w-7 p-0"
              onClick={handleAddFlavor}
              disabled={isSubmitting || !newFlavorName.trim()}
              aria-label="Add flavor"
            >
              <Check size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
