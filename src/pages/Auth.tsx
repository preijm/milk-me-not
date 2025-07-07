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
    const checkResetMode = () => {
      // Check if we're on the reset password route
      const isResetRoute = location.pathname === '/auth/reset-password';
      
      // Check for tokens in hash fragment (Supabase reset links use hash)
      const hash = window.location.hash;
      console.log("Full hash:", hash);
      
      if (hash && hash.length > 1) {
        // Remove the # and parse parameters
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log("Hash parsing results:", { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
        
        // Show reset form if we have recovery tokens OR if we're on the reset route
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log("Found valid recovery tokens, showing reset form");
          setIsPasswordReset(true);
          
          // Clean up the URL but preserve the hash for password update
          // Don't replace state here, we need the tokens for the password update
        } else if (isResetRoute) {
          console.log("On reset route without tokens, showing reset form");
          setIsPasswordReset(true);
        }
      } else if (isResetRoute) {
        console.log("On reset route without hash, showing reset form");
        setIsPasswordReset(true);
      }
    };
    
    checkResetMode();
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
      console.log("Attempting to update password...");
      
      // Check for tokens in hash and set session if needed
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log("Setting session from hash tokens before password update");
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error("Failed to establish session. Please click the reset link from your email again.");
        }
        
        console.log("Session set successfully:", !!data.session);
      }

      // Verify we have a valid session before proceeding
      const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
      
      if (getSessionError || !session) {
        console.error("No valid session found:", getSessionError);
        throw new Error("No authentication session found. Please click the reset link from your email again.");
      }
      
      console.log("Valid session confirmed, proceeding with password update");

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
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
      console.error("Password update failed:", error);
      toast({
        title: "Error updating password",
        description: error.message || "Please click the reset link from your email again",
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
