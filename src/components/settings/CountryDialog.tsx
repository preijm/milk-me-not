import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { CountrySelect } from "@/components/milk-test/CountrySelect";

interface CountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CountryDialog = ({ open, onOpenChange }: CountryDialogProps) => {
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_country_code")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile) {
        setDefaultCountry(profile.default_country_code);
      }
    };
    getProfile();
  }, [open]);

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ default_country_code: defaultCountry })
        .eq("id", userId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Country updated successfully.",
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Country Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateCountry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Country
            </label>
            <CountrySelect country={defaultCountry} setCountry={setDefaultCountry} />
            <p className="text-xs text-muted-foreground mt-2">
              This will be pre-selected when adding new milk tests
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Country"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
