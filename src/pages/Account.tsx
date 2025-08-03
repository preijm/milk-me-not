import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Lock, User, Shield, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import NotificationSettings from "@/components/settings/NotificationSettings";
const Account = () => {
  const [username, setUsername] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
      } = await supabase.from('profiles').select('username, default_country_code').eq('id', user.id).maybeSingle();
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
      const {
        data: existingUser
      } = await supabase.from('profiles').select('id').eq('username', username).neq('id', userId).maybeSingle();
      if (existingUser) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive"
        });
        return;
      }
      const {
        error
      } = await supabase.from('profiles').update({
        username,
        default_country_code: defaultCountry
      }).eq('id', userId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }
    setIsChangingPassword(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Password updated successfully."
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen py-8 pt-20 pb-24 md:pb-8">
          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 animate-fade-up">
              {/* Header Section */}
              <div className="bg-[#f3f4f6] px-8 py-6">
                <h1 className="text-3xl font-bold mb-2 text-[#01bd71]">
                  Account Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account preferences and security
                </p>
              </div>
              
              <div className="p-8">
              
              <Tabs defaultValue="profile" className="w-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <TabsList className="flex flex-row md:flex-col h-fit w-full md:w-48 p-1">
                    <TabsTrigger value="profile" className="flex-1 md:w-full justify-center md:justify-start gap-2 mb-0 md:mb-1">
                      <User className="w-8 h-8 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 md:w-full justify-center md:justify-start gap-2 mb-0 md:mb-1">
                      <Shield className="w-8 h-8 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 md:w-full justify-center md:justify-start gap-2">
                      <Bell className="w-8 h-8 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 h-[280px]">
                    <TabsContent value="profile" className="space-y-6 mt-0 h-full">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <Input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={30} pattern="^[a-zA-Z0-9_-]+$" title="Username can only contain letters, numbers, underscores, and hyphens" className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Country (optional)
                          </label>
                          <CountrySelect country={defaultCountry} setCountry={setDefaultCountry} />
                          <p className="text-xs text-gray-500 mt-1">
                            This will be pre-selected when adding new milk tests
                          </p>
                        </div>

                        <Button type="submit" variant="brand" className="w-full" disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save Profile"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6 mt-0 h-full">
                      <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <Input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} showPasswordToggle className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} showPasswordToggle className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm" />
                        </div>
                        
                        <Button type="submit" variant="brand" className="w-full" disabled={isChangingPassword || !newPassword || !confirmPassword}>
                          <Lock className="w-4 h-4 mr-2" />
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6 mt-0 h-full">
                      <NotificationSettings />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
              </div>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <MobileFooter />
    </div>;
};
export default Account;