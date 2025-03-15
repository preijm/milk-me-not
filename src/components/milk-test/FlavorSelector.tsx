
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const createFlavorKey = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const handleAddFlavor = async () => {
    if (!newFlavorName.trim()) {
      toast({
        title: "Invalid flavor name",
        description: "Please enter a flavor name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const key = createFlavorKey(newFlavorName);
    
    try {
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be signed in to add flavors",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if flavor with this key already exists
      const { data: existingFlavors } = await supabase
        .from('flavors')
        .select('key')
        .eq('key', key);
      
      if (existingFlavors && existingFlavors.length > 0) {
        toast({
          title: "Flavor already exists",
          description: "A flavor with this name already exists",
          variant: "destructive"
        });
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
        toast({
          title: "Error",
          description: error.message || "Failed to add flavor. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "New flavor added"
        });
        setNewFlavorName("");
        if (onAddNewFlavor) {
          onAddNewFlavor();
        }
        setIsAddingFlavor(false);
      }
    } catch (error) {
      console.error('Error adding flavor:', error);
      toast({
        title: "Error",
        description: "Failed to add flavor. Please try again.",
        variant: "destructive"
      });
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
        
        {!isAddingFlavor && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 h-8 w-8 p-0"
            onClick={() => setIsAddingFlavor(true)}
            aria-label="Add new flavor"
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
      
      {/* Add flavor section */}
      {isAddingFlavor && (
        <div className="p-3 bg-white rounded-lg border shadow-sm mb-2 max-w-md">
          <div className="flex gap-2 items-center">
            <Input
              value={newFlavorName}
              onChange={(e) => setNewFlavorName(e.target.value)}
              placeholder="Add new flavor"
              className="h-9 border-2 rounded-lg text-sm flex-1"
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
              className="bg-cream-200 hover:bg-cream-300 border-cream-200 text-gray-800 h-9"
              onClick={handleAddFlavor}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
