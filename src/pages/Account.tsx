
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Lock } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";

const Account = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [badgeColor, setBadgeColor] = useState("emerald");
  const [isUpdatingColor, setIsUpdatingColor] = useState(false);
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
        .select('username, badge_color')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username);
        setBadgeColor(profile.badge_color || 'emerald');
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
        .update({ username })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully.",
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

  const handleUpdateBadgeColor = async (color: string) => {
    if (!userId) return;

    setIsUpdatingColor(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ badge_color: color })
        .eq('id', userId);

      if (error) throw error;

      setBadgeColor(color);
      toast({
        title: "Success",
        description: "Badge color updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingColor(false);
    }
  };

  const colorOptions = [
    { name: 'Emerald', value: 'emerald', from: 'from-emerald-500/90', to: 'to-emerald-600/90' },
    { name: 'Blue', value: 'blue', from: 'from-blue-500/90', to: 'to-blue-600/90' },
    { name: 'Purple', value: 'purple', from: 'from-purple-500/90', to: 'to-purple-600/90' },
    { name: 'Pink', value: 'pink', from: 'from-pink-500/90', to: 'to-pink-600/90' },
    { name: 'Orange', value: 'orange', from: 'from-orange-500/90', to: 'to-orange-600/90' },
    { name: 'Red', value: 'red', from: 'from-red-500/90', to: 'to-red-600/90' },
  ];

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

                <Button 
                  type="submit" 
                  className="w-full" 
                  style={{
                    backgroundColor: '#2144FF',
                    color: 'white'
                  }} 
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Username"}
                </Button>
              </form>

              <div className="h-px bg-gray-200 my-8" />

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Badge Color</h3>
                <div className="grid grid-cols-3 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleUpdateBadgeColor(color.value)}
                      disabled={isUpdatingColor}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        badgeColor === color.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center text-white font-medium shadow-sm`}>
                        {username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                  className="w-full" 
                  style={{
                    backgroundColor: '#2144FF',
                    color: 'white'
                  }} 
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
    </div>
  );
};

export default Account;

