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
    const checkResetMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      console.log("Checking for reset mode, code:", code);
      
      if (code) {
        console.log("Found reset code, exchanging for session");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Error exchanging code for session:", error);
            toast({
              title: "Invalid reset link",
              description: "Please request a new password reset",
              variant: "destructive"
            });
            return;
          }
          
          if (data.session) {
            console.log("Session established successfully");
            setIsPasswordReset(true);
            
            // Clean up the URL to avoid issues
            window.history.replaceState(null, '', '/auth');
          }
        } catch (error) {
          console.error("Session exchange error:", error);
          toast({
            title: "Error processing reset link",
            description: "Please request a new password reset",
            variant: "destructive"
          });
        }
      }
    };
    
    checkResetMode();
  }, [location, toast]);

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
      // Verify we have a session by getting the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No authentication session found. Please click the reset link from your email again.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password"
      });

      // Clear the hash from URL
      window.history.replaceState(null, '', '/auth');
      
      // Show login form after successful password reset
      setIsPasswordReset(false);
      
      toast({
        title: "Please log in",
        description: "Use your new password to log in",
      });
      
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Please click the reset link from your email again",
        variant: "destructive"
      });
      console.error("Password update error:", error);
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
                      showPasswordToggle
                      className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      showPasswordToggle
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
