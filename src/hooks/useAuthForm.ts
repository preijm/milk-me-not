import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AuthFormData {
  email: string;
  password: string;
  username: string;
}

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const fromAdd = location.state?.from === '/add';

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // First validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid email format",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Try to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Show a generic error message for invalid credentials
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          // For other errors, show the specific message
          toast({
            title: "Login Failed",
            description: error.message || 'Something went wrong. Please try again.',
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });

      navigate(fromAdd ? "/add" : "/my-results");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async ({ email, password, username }: AuthFormData) => {
    setLoading(true);
    try {
      // Check if username is available before signup
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }


      console.log("Starting sign up process with:", { email, username });
      
      // With email confirmation disabled, this should create an account and sign in immediately
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            username 
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        
        // Handle duplicate email error specifically
        if (error.message.includes('User already registered')) {
          toast({
            title: "Email already registered",
            description: "An account with this email already exists. Please log in instead.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        throw error;
      }
      
      console.log("Signup response:", data);
      
      // Always redirect to pending confirmation page after successful signup
      if (data && (data.session || data.user)) {
        console.log("User signup successful");
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account.",
        });
        
        // Redirect to auth page and indicate pending email confirmation
        navigate("/auth", { state: { emailPending: true, email } });
      } else {
        // Fallback for unexpected scenarios
        console.log("Unexpected signup response:", data);
        toast({
          title: "Something went wrong",
          description: "Please try again or contact support.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Caught error during signup:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    handleSignUp,
  };
};
