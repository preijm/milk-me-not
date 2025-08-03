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
        <div className="flex items-center justify-center min-h-screen py-8 pt-20 pb-24 md:pb-8">
          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              <h1 className="text-3xl font-bold text-center mb-8 text-primary">
                Account Settings
              </h1>
              
              <Tabs defaultValue="profile" className="w-full">
                <div className="flex gap-8">
                  <TabsList className="flex flex-col h-fit w-48 p-1">
                    <TabsTrigger value="profile" className="w-full justify-start gap-2 mb-1">
                      <User className="w-4 h-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="w-full justify-start gap-2 mb-1">
                      <Shield className="w-4 h-4" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="w-full justify-start gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1">
                    <TabsContent value="profile" className="space-y-6 mt-0">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
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
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6 mt-0">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                          <div>
                            <h3 className="font-semibold text-blue-800">Account Security</h3>
                            <p className="text-blue-700 text-sm mt-1">
                              Your account is secured with email authentication. Keep your password strong and unique.
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleUpdatePassword} className="space-y-6">
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
                            className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
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
                            className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          variant="brand"
                          className="w-full" 
                          disabled={isChangingPassword || !newPassword || !confirmPassword}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6 mt-0">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Bell className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                          <div>
                            <h3 className="font-semibold text-yellow-800">Coming Soon</h3>
                            <p className="text-yellow-700 text-sm mt-1">
                              Notification preferences will be available in a future update.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <MobileFooter />
    </div>
  );
};

export default Account;