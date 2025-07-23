
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Lock } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import { CountrySelect } from "@/components/milk-test/CountrySelect";

const Account = () => {
  const [username, setUsername] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
        .select('username, default_country_code')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username);
        setDefaultCountry(profile.default_country_code);
      }
    };

    getProfile();
  }, [navigate]);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          username,
          default_country_code: defaultCountry 
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                Account Settings
              </h1>
              
              <form onSubmit={handleUpdateUsername} className="space-y-6 mb-8">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="^[a-zA-Z0-9_-]+$"
                    title="Username can only contain letters, numbers, underscores, and hyphens"
                    className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Country (optional)
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
                  className="w-full" 
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </form>

              <div className="h-px bg-gray-200 my-8" />

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                />
                <Button 
                  type="submit" 
                  variant="brand"
                  className="w-full" 
                  disabled={isChangingPassword}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <MobileFooter />
    </div>
  );
};

export default Account;

