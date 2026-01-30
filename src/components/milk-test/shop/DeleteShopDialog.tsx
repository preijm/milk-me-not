import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string | null;
  onSuccess: () => void;
}

export const DeleteShopDialog = ({
  open,
  onOpenChange,
  shopName,
  onSuccess,
}: DeleteShopDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!shopName) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("shops")
        .delete()
        .eq("name", shopName);

      if (error) throw error;

      toast({
        title: "Shop deleted",
        description: "The shop has been removed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["shops"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting shop:", error);
      toast({
        title: "Error",
        description: "Failed to delete shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shop</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{shopName}"? This action cannot be
            undone. Any milk tests referencing this shop will keep the shop name
            in their records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
