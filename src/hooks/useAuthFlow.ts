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

      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = urlParams.get('code') || hashParams.get('code');
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
      
      console.log("Checking for reset code:", { code: !!code });
      
      if (code) {
        try {
          console.log("Found reset code, exchanging for session");
          setIsResetting(true);
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Code exchange error:", error);
            toast({
              title: "Invalid reset link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
              variant: "destructive"
            });
            window.history.replaceState(null, '', '/auth');
            setIsPasswordReset(false);
            return;
          }
          
          console.log("Code exchange successful, verifying session...");
          
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
          
        } catch (error: any) {
          console.error("Code exchange failed:", error);
          toast({
            title: "Error",
            description: "Failed to process reset link. Please try again.",
            variant: "destructive"
          });
          window.history.replaceState(null, '', '/auth');
          setIsPasswordReset(false);
        } finally {
          setIsResetting(false);
        }
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