import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Globe } from "lucide-react";
import { CountrySelect } from "@/components/milk-test/CountrySelect";

export default function CountrySettings() {
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('default_country_code')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setDefaultCountry(profile.default_country_code);
      }
    };

    getProfile();
  }, [navigate]);

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          default_country_code: defaultCountry 
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Country updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Globe className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800">Default Country</h3>
              <p className="text-green-700 text-sm mt-1">
                Set your default country to auto-fill when adding new milk tests.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateCountry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <CountrySelect
              country={defaultCountry}
              setCountry={setDefaultCountry}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be pre-selected when adding new milk tests
            </p>
          </div>
          
          <Button 
            type="submit" 
            variant="brand"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Country"}
          </Button>
        </form>
      </div>
    </div>
  );
}
