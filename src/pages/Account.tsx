import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Lock, User, Shield, Bell, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { useAuth } from "@/contexts/AuthContext";

const Account = () => {
  const [username, setUsername] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
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
          default_country_code: defaultCountry,
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
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });

      setNewPassword("");
      setConfirmPassword("");
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
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen py-8 pt-20 pb-24 md:pb-8">
          <div className="container max-w-2xl mx-auto px-4 relative z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 animate-fade-up">
              {/* Header Section - Mobile optimized */}
              <div className="bg-gradient-to-r from-[#00bf63] to-[#00a855] px-6 py-8 md:px-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Settings
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  Manage your account preferences
                </p>
              </div>
              
              <div className="p-4 md:p-8">
                <Tabs defaultValue="profile" className="w-full">
                  {/* Mobile-first Tab Navigation */}
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 h-auto">
                    <TabsTrigger 
                      value="profile" 
                      className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:text-[#00bf63]"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-xs font-medium">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security" 
                      className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:text-[#00bf63]"
                    >
                      <Shield className="w-5 h-5" />
                      <span className="text-xs font-medium">Security</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="flex flex-col gap-1 py-3 data-[state=active]:bg-white data-[state=active]:text-[#00bf63]"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="text-xs font-medium">Notifications</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-4 mt-0">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
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
                          className="bg-white border-gray-300"
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
                        <p className="text-xs text-gray-500 mt-2">
                          This will be pre-selected when adding new milk tests
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#00bf63] hover:bg-[#00a855] text-white"
                        disabled={loading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-4 mt-0">
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Change your password</strong>
                          <br />
                          Enter a new password below to update your account security.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          showPasswordToggle
                          className="bg-white border-gray-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          showPasswordToggle
                          className="bg-white border-gray-300"
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-[#00bf63] hover:bg-[#00a855] text-white"
                        disabled={isChangingPassword || !newPassword || !confirmPassword}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="mt-0">
                    <NotificationSettings />
                  </TabsContent>
                </Tabs>

                {/* Sign Out Button - Prominent placement */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Account;
