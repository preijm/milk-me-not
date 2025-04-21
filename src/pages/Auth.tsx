
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "@/components/MenuBar";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import AuthForm from "@/components/auth/AuthForm";
import ResetPasswordDialog from "@/components/auth/ResetPasswordDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Page-level wrapper for the Auth view
const Auth = () => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in password reset mode
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('#access_token=')) {
      setIsPasswordReset(true);
    }
  }, [location]);

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      toast({
        title: "Password required",
        description: "Please enter a new password",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password"
      });

      navigate('/auth');
      setIsPasswordReset(false);
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              {isPasswordReset ? (
                <>
                  <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                    Reset Your Password
                  </h1>
                  <div className="space-y-6">
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                    />
                    <Button
                      className="w-full"
                      style={{
                        backgroundColor: '#2144FF',
                        color: 'white'
                      }}
                      disabled={isResetting}
                      onClick={handlePasswordUpdate}
                    >
                      {isResetting ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                    Welcome Back
                  </h1>
                  <AuthForm onForgotPassword={() => setShowResetDialog(true)} />
                </>
              )}
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <ResetPasswordDialog open={showResetDialog} onOpenChange={setShowResetDialog} />
    </div>
  );
};

export default Auth;
