import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoryButton } from "@/components/story/primitives";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
export default function CountrySettings() {
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const getProfile = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      const {
        data: profile
      } = await supabase.from('profiles').select('default_country_code').eq('id', user.id).maybeSingle();
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
      const {
        error
      } = await supabase.from('profiles').update({
        default_country_code: defaultCountry
      }).eq('id', userId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Country updated successfully."
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="pt-6">
      <div className="space-y-6">
        

        <form onSubmit={handleUpdateCountry} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
              Country
            </label>
            <CountrySelect country={defaultCountry} setCountry={setDefaultCountry} />
            <p className="mt-1.5 text-[0.75rem] text-story-muted-2">
              This will be pre-selected when adding new milk tests
            </p>
          </div>
          
          <StoryButton type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving…" : "Save country"}
          </StoryButton>
        </form>
      </div>
    </div>;
}