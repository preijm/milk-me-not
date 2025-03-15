
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddFlavorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlavorAdded: () => void;
}

export const AddFlavorDialog = ({ open, onOpenChange, onFlavorAdded }: AddFlavorDialogProps) => {
  const [flavorName, setFlavorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const createFlavorKey = (name: string): string => {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flavorName.trim()) {
      toast({
        title: "Invalid flavor name",
        description: "Please enter a flavor name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const key = createFlavorKey(flavorName);
    
    try {
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
      
      // Add new flavor to database
      const { error } = await supabase
        .from('flavors')
        .insert({
          name: flavorName.trim(),
          key: key,
          ordering: 999 // Default ordering
        });
      
      if (error) {
        console.error('Error adding flavor:', error);
        toast({
          title: "Error",
          description: "Failed to add flavor. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Flavor added",
          description: "The new flavor has been added successfully"
        });
        setFlavorName("");
        onFlavorAdded();
        onOpenChange(false);
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Flavor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flavor-name">Flavor Name</Label>
            <Input 
              id="flavor-name"
              placeholder="e.g. Vanilla, Chocolate, etc."
              value={flavorName}
              onChange={(e) => setFlavorName(e.target.value)}
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-black text-white"
            >
              {isSubmitting ? "Adding..." : "Add Flavor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
