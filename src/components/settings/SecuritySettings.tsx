import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Shield } from "lucide-react";
export default function SecuritySettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const {
    toast
  } = useToast();
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
  return <div className="pt-6">
      <div className="space-y-8">
        

        <div>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
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
            
            <Button type="submit" variant="brand" disabled={isChangingPassword || !newPassword || !confirmPassword}>
              <Lock className="w-4 h-4 mr-2" />
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>;
}