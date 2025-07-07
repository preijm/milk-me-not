
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
        <div className="container max-w-sm mx-auto px-4 relative z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/30">
              <h1 className="text-2xl font-medium text-center mb-6 text-gray-900">
                Account
              </h1>
              
              <form onSubmit={handleUpdateUsername} className="space-y-4 mb-6">
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
                  className="border-gray-300"
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </form>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Badge Color</p>
                <div className="flex gap-2 justify-center">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleUpdateBadgeColor(color.value)}
                      disabled={isUpdatingColor}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.from} ${color.to} transition-all ${
                        badgeColor === color.value 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="border-gray-300"
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  showPasswordToggle
                  className="border-gray-300"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={isChangingPassword}
                >
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

