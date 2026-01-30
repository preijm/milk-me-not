import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface EditShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: { name: string; country_code: string | null } | null;
  onSuccess: () => void;
}

export const EditShopDialog = ({
  open,
  onOpenChange,
  shop,
  onSuccess,
}: EditShopDialogProps) => {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setCountryCode(shop.country_code);
    }
  }, [shop]);

  const handleSave = async () => {
    if (!shop || !name.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          name: name.trim(),
          country_code: countryCode,
        })
        .eq("name", shop.name);

      if (error) throw error;

      toast({
        title: "Shop updated",
        description: "The shop has been updated successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["shops"] });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating shop:", error);
      toast({
        title: "Error",
        description: "Failed to update shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Shop</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="shop-name">Shop Name</Label>
            <Input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter shop name..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Country (optional)</Label>
            <CountrySelect
              country={countryCode}
              setCountry={setCountryCode}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
