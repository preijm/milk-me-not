
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const errorMessage = error.message.includes('Invalid login credentials') 
          ? 'Incorrect email or password. Please try again.' 
          : error.message;
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
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
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup response:", data);
      
      // Check if user was immediately signed in (no email confirmation needed)
      if (data && data.session) {
        console.log("User signed in successfully with session");
        toast({
          title: "Account created!",
          description: "You're now logged in. Welcome to the community!",
        });
        
        navigate(fromAdd ? "/add" : "/my-results");
      } else if (data && data.user && !data.session) {
        // This can happen if email confirmation is required despite settings
        console.log("User created but no session - email confirmation may be required");
        toast({
          title: "Account created",
          description: "Please check your email to complete registration.",
        });
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
