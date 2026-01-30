import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  clearRecoveryMode,
  getRecoveryFromUrlHash,
  getStoredRecoveryAccessToken,
  isRecoveryMode,
  setRecoveryMode,
  updatePasswordWithAccessToken,
} from "@/lib/auth/recovery";

export const useAuthFlow = () => {
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const handleAuthFlow = async () => {
      // Check if user was redirected from signup with pending email confirmation
      if (location.state?.emailPending && location.state?.email) {
        setIsEmailPending(true);
        setUserEmail(location.state.email);
        // Clear the state to prevent showing the message again on refresh
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // Log the full URL for debugging
      console.log("Current URL:", window.location.href);

      const { type, accessToken } = getRecoveryFromUrlHash();
      
      // Handle email confirmation - sign out user and show success message
      if (type === 'signup') {
        console.log("Email confirmation detected");
        // Sign out the user so they can log in fresh
        await supabase.auth.signOut();
        setIsEmailConfirmed(true);
        setIsEmailPending(false); // Clear pending state
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      
      // If URL itself indicates recovery, set recovery mode (works even when event doesn't fire)
      if (type === 'recovery' && accessToken) {
        setRecoveryMode(accessToken);
        // Clean up hash to avoid leaking tokens via copy/paste
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Recovery mode can be set either by AuthContext event or by the hash fallback above
      const recoveryMode = isRecoveryMode();
      console.log("Password recovery mode:", recoveryMode);

      if (recoveryMode) {
        console.log("Password recovery mode detected, showing reset form");
        setIsPasswordReset(true);
      } else {
        setIsPasswordReset(false);
      }
    };
    
    handleAuthFlow();
  }, [location]);

  const handlePasswordUpdate = async (newPassword: string, confirmPassword: string) => {
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

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters with uppercase, lowercase, and number",
        variant: "destructive"
      });
      return;
    }

    // Enhanced password validation for reset
    if (!/(?=.*[a-z])/.test(newPassword)) {
      toast({
        title: "Password requirements not met",
        description: "Password must contain at least one lowercase letter",
        variant: "destructive"
      });
      return;
    }
    
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      toast({
        title: "Password requirements not met", 
        description: "Password must contain at least one uppercase letter",
        variant: "destructive"
      });
      return;
    }
    
    if (!/(?=.*\d)/.test(newPassword)) {
      toast({
        title: "Password requirements not met",
        description: "Password must contain at least one number", 
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    try {
      console.log("Attempting to update password...");
      
      const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

      // Primary path: we have a normal Supabase session
      if (!getSessionError && session) {
        console.log("Valid session confirmed, proceeding with password update");

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error("Password update error:", error);
          throw error;
        }
      } else {
        // Fallback path: recovery link provided access_token but no refresh_token -> no session
        const token = getStoredRecoveryAccessToken();
        if (!token) {
          console.error("No valid session found:", getSessionError);
          throw new Error(
            "No authentication session found. Please click the reset link from your email again."
          );
        }

        console.log(
          "No session, using stored recovery access token to update password"
        );
        await updatePasswordWithAccessToken({
          accessToken: token,
          password: newPassword,
        });
      }

      console.log("Password updated successfully");
      
      // Clear the recovery mode flag
      clearRecoveryMode();
      
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password"
      });

      setIsPasswordReset(false);
      
      // Redirect to auth page
      window.location.href = '/auth';
      
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Password update failed:", error);
      toast({
        title: "Error updating password",
        description: err.message || "Please request a new password reset link",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return {
    isPasswordReset,
    isEmailConfirmed,
    isEmailPending,
    userEmail,
    isResetting,
    setIsEmailConfirmed,
    setIsEmailPending,
    handlePasswordUpdate
  };
};