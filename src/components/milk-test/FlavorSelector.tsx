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
  const [isAddingFlavor, setIsAddingFlavor] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('Authentication required to add flavors');
        setIsSubmitting(false);
        return;
      }
      
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
      
      // Add new flavor to database with RLS compliance
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
        if (onAddNewFlavor) {
          onAddNewFlavor();
        }
        setIsAddingFlavor(false);
      }
    } catch (error) {
      console.error('Error adding flavor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAddingFlavor(false);
    setNewFlavorName("");
  };

  return (
    <div>
      {/* Flavors list with plus button inline */}
      <div className="flex flex-wrap gap-2 mb-3">
        {flavors.map(flavor => (
          <Badge 
            key={flavor.id} 
            variant="flavor" 
            className={`cursor-pointer transition-all px-2 py-1 text-[11px] font-medium ${
              selectedFlavors.includes(flavor.key) 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'hover:bg-purple-50'
            }`} 
            onClick={() => onFlavorToggle(flavor.key)}
          >
            {/* Use the flavor name from the API or format the key as a fallback */}
            {flavor.name || formatDisplayName(flavor.key)}
          </Badge>
        ))}
        
        {!isAddingFlavor && (
          <Button
            variant="outline"
            size="sm"
            className="rounded bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 h-7 w-7 p-0"
            onClick={() => setIsAddingFlavor(true)}
            aria-label="Add new flavor"
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      
      {/* Add flavor section */}
      {isAddingFlavor && (
        <div className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 shadow-lg mb-3 animate-fade-in">
          <div className="flex gap-3 items-center">
            <Input
              value={newFlavorName}
              onChange={(e) => setNewFlavorName(e.target.value)}
              placeholder="Enter new flavor name..."
              className="h-10 border-2 border-purple-200 rounded-lg text-sm flex-1 focus:border-purple-400 focus:ring-purple-400"
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 px-4 border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                onClick={handleAddFlavor}
                disabled={isSubmitting || !newFlavorName.trim()}
              >
                {isSubmitting ? "Adding..." : "Add Flavor"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
