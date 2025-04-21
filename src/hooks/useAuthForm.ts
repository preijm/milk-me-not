
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            username 
          },
          emailRedirectTo: `${window.location.origin}/auth#type=signup`
        }
      });
      
      if (error) throw error;
      
      if (data && data.session) {
        toast({
          title: "Account created!",
          description: "You're now logged in. Welcome to the community!",
        });
        
        navigate(fromAdd ? "/add" : "/my-results");
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
        });
      }
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

  return {
    loading,
    handleLogin,
    handleSignUp,
  };
};
