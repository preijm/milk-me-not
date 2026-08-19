import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Kicker, STORY_ALERT_ACTION_CLASS, STORY_ALERT_CANCEL_CLASS, STORY_DIALOG_SURFACE } from "@/components/story";
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

  // Stays an AlertDialog rather than a StoryDialog: a confirmation should not
  // close on a stray click outside it. It borrows the same surface so the two
  // are indistinguishable.
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`${STORY_DIALOG_SURFACE} sm:max-w-md`}>
        <header className="text-left">
          <Kicker>Remove a shop</Kicker>
          <AlertDialogTitle className="story-display pt-3 text-[1.75rem] leading-tight text-story-ink">
            Delete {shopName ? `"${shopName}"` : "this shop"}?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 text-[0.9375rem] leading-relaxed text-story-muted">
            It disappears from the shop list and cannot be brought back. Ratings already filed against it keep the
            name — nobody's rating loses its place.
          </AlertDialogDescription>
        </header>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={isLoading}
            className={STORY_ALERT_CANCEL_CLASS}
          >
            Keep it
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className={`${STORY_ALERT_ACTION_CLASS} bg-story-amber-dark`}
          >
            {isLoading ? "Deleting…" : "Delete the shop"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
