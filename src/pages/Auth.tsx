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

  // Check for password reset code and exchange it for session
  useEffect(() => {
    const handlePasswordReset = async () => {
      // Check for code parameter in URL (from password reset email)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = urlParams.get('code') || hashParams.get('code');
      
      console.log("Checking for reset code:", { code: !!code });
      
      if (code) {
        try {
          console.log("Found reset code, exchanging for session");
          setIsResetting(true);
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Code exchange error:", error);
            toast({
              title: "Invalid reset link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive"
            });
            // Redirect to login form if code exchange fails
            window.history.replaceState(null, '', '/auth');
            setIsPasswordReset(false);
            return;
          }
          
          console.log("Code exchange successful, verifying session...");
          
          // Verify session is actually available after code exchange
          const { data: { session: verifySession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !verifySession) {
            console.error("Session verification failed:", sessionError);
            toast({
              title: "Session Error",
              description: "Failed to establish session. Please try the reset link again.",
              variant: "destructive"
            });
            window.history.replaceState(null, '', '/auth');
            setIsPasswordReset(false);
            return;
          }
          
          console.log("Session verified successfully");
          setIsPasswordReset(true);
          
          // Keep the URL with the code until password is successfully updated
          
        } catch (error: any) {
          console.error("Code exchange failed:", error);
          toast({
            title: "Error",
            description: "Failed to process reset link. Please try again.",
            variant: "destructive"
          });
          // Redirect to login form if code exchange fails
          window.history.replaceState(null, '', '/auth');
          setIsPasswordReset(false);
        } finally {
          setIsResetting(false);
        }
      } else if (location.pathname === '/auth/reset-password') {
        // If on reset route without code, redirect to login and show message
        console.log("On reset route without code, redirecting to login");
        toast({
          title: "Reset link required",
          description: "Please click the reset link from your email to set a new password.",
          variant: "destructive"
        });
        window.history.replaceState(null, '', '/auth');
        setIsPasswordReset(false);
      }
    };
    
    handlePasswordReset();
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
      console.log("Attempting to update password...");
      
      // Verify we have a valid session before proceeding
      const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
      
      if (getSessionError || !session) {
        console.error("No valid session found:", getSessionError);
        throw new Error("No authentication session found. Please click the reset link from your email again.");
      }
      
      console.log("Valid session confirmed, proceeding with password update");

      // Update the password
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

      // Clear the URL and show login form
      window.history.replaceState(null, '', '/auth');
      setIsPasswordReset(false);
      
      toast({
        title: "Please log in",
        description: "Use your new password to log in",
      });
      
    } catch (error: any) {
      console.error("Password update failed:", error);
      toast({
        title: "Error updating password",
        description: error.message || "Please request a new password reset link",
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
                    {isResetting && (
                      <div className="text-center">
                        <p className="text-gray-600">Setting up your password reset...</p>
                      </div>
                    )}
                    {!isResetting && (
                      <>
                        <p className="text-center text-gray-600 mb-6">
                          Enter your new password below.
                        </p>
                        <div className="space-y-4">
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
                    )}
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
