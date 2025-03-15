
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
          name: flavorName.trim(),
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
      <DialogContent className="sm:max-w-xs p-4">
        <DialogHeader>
          <DialogTitle className="text-center">Add Flavor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input 
            placeholder="Flavor name"
            value={flavorName}
            onChange={(e) => setFlavorName(e.target.value)}
            className="w-full"
            autoFocus
          />
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-cream-300 hover:bg-cream-200 text-milk-500"
          >
            {isSubmitting ? "Adding..." : "Add Flavor"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
