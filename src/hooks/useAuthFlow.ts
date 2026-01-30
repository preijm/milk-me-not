import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
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
      
      // Check for password recovery mode set by AuthContext's PASSWORD_RECOVERY event
      const recoveryMode = sessionStorage.getItem('passwordRecoveryMode');
      console.log("Password recovery mode from sessionStorage:", recoveryMode);
      
      if (recoveryMode === 'true') {
        console.log("Password recovery mode detected, showing reset form");
        setIsPasswordReset(true);
        // Clean up the URL if there are hash params
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
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
      
      if (getSessionError || !session) {
        console.error("No valid session found:", getSessionError);
        throw new Error("No authentication session found. Please click the reset link from your email again.");
      }
      
      console.log("Valid session confirmed, proceeding with password update");

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      
      // Clear the recovery mode flag
      sessionStorage.removeItem('passwordRecoveryMode');
      
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