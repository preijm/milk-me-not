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
      console.log("Search params:", window.location.search);
      console.log("Hash:", window.location.hash);

      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for various possible parameters that Supabase might use
      const code = urlParams.get('code') || hashParams.get('code');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type') || urlParams.get('type');
      
      console.log("URL parameters found:", { 
        code: !!code, 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        type 
      });
      
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
      
      // Handle password reset - check for various possible indicators
      if (code || (accessToken && refreshToken) || type === 'recovery') {
        try {
          console.log("Password reset link detected, processing...");
          setIsResetting(true);
          
          // If we have a code, try to exchange it for a session
          if (code) {
            console.log("Found reset code, exchanging for session");
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error("Code exchange error:", error);
              throw error;
            }
            console.log("Code exchange successful:", data);
          }
          
          // If we have tokens in the hash, set the session directly
          if (accessToken && refreshToken) {
            console.log("Found tokens in hash, setting session");
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error("Session setting error:", error);
              throw error;
            }
            console.log("Session set successfully:", data);
          }
          
          // Verify we have a valid session
          console.log("Verifying session...");
          const { data: { session: verifySession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !verifySession) {
            console.error("Session verification failed:", sessionError);
            throw new Error("Failed to establish valid session");
          }
          
          console.log("Session verified successfully, user can reset password");
          setIsPasswordReset(true);
          
          // Clean up the URL
          window.history.replaceState(null, '', window.location.pathname);
          
        } catch (error: any) {
          console.error("Password reset setup failed:", error);
          toast({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive"
          });
          setIsPasswordReset(false);
        } finally {
          setIsResetting(false);
        }
      } else {
        // No reset parameters found
        console.log("No reset parameters found in URL");
        setIsPasswordReset(false); 
      }
    };
    
    handleAuthFlow();
  }, [location, toast]);

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
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password"
      });

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