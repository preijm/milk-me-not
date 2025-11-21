import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Lock, User, Shield, Bell, HelpCircle, LogOut, ChevronRight, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";
import { CountrySelect } from "@/components/milk-test/CountrySelect";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { useIsMobile } from "@/hooks/use-mobile";
const Account = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const isMobile = useIsMobile();
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
      setEmail(user.email || "");
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
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mobile view
  if (isMobile) {
    return <div className="min-h-screen bg-background">
        <MenuBar />
        
        {/* Settings Content */}
        <div className="px-4 py-6 pb-24 pt-20 space-y-8">
          {/* Account Section */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
              Account
            </h3>
            
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
              <button onClick={() => navigate('/account/profile')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">Profile</h4>
                  <p className="text-sm text-muted-foreground">Edit your personal information</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
              
              <button onClick={() => navigate('/account/security')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">Security</h4>
                  <p className="text-sm text-muted-foreground">Password and authentication</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          </div>
          
          {/* Preferences Section */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
              Preferences
            </h3>
            
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
              <button onClick={() => navigate('/account/notifications')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Manage your alerts</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
              
              <button onClick={() => navigate('/account/country')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">Country</h4>
                  <p className="text-sm text-muted-foreground">Set your default location</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          </div>
          
          {/* Support Section */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase mb-4 px-1 tracking-wide">
              Support
            </h3>
            
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
              <button onClick={() => navigate('/contact')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">Contact   </h4>
                  <p className="text-sm text-muted-foreground">​Reach out to our team      </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
              
              <button onClick={() => navigate('/about')} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">About </h4>
                  <p className="text-sm text-muted-foreground">Learn about our story</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            </div>
          </div>
          
          {/* Log Out Button */}
          <Button 
            onClick={handleLogout} 
            className="w-full text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            style={{backgroundColor: '#2144ff'}}
          >
            <LogOut className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Log Out
          </Button>
          
          {/* Version */}
          
        </div>
        
        <MobileFooter />
      </div>;
  }

  // Desktop view
  return <div className="min-h-screen">
...
      <MenuBar />
      <BackgroundPattern>
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
                      <User className="w-6 h-6 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 md:w-full justify-center md:justify-start gap-2 mb-0 md:mb-1">
                      <Shield className="w-6 h-6 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 md:w-full justify-center md:justify-start gap-2">
                      <Bell className="w-6 h-6 md:w-4 md:h-4" />
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
      </BackgroundPattern>
      <MobileFooter />
    </div>;
};
export default Account;