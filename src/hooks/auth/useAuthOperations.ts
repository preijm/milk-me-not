import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword, 
  validateUsername,
  loginRateLimit,
  signupRateLimit,
  passwordResetRateLimit,
  logSecurityEvent
} from '@/lib/security';

export interface AuthFormData {
  email: string;
  password: string;
  username: string;
}

export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();
  
  const fromPath = location.state?.from || '/results';

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const rateLimitKey = `auth_${sanitizedEmail}`;
    
    if (!loginRateLimit.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(loginRateLimit.getRemainingTime(rateLimitKey) / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: "destructive"
      });
      return { success: false };
    }

    // Validate inputs
    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    loginRateLimit.recordAttempt(rateLimitKey);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      
      if (error) {
        // Log failed login attempt for security monitoring
        await logSecurityEvent('login_failed', { 
          email: sanitizedEmail, 
          error: error.message 
        });

        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
        return { success: false };
      }

      await refreshAuth();
      navigate(fromPath);
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, username }: AuthFormData) => {
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedUsername = sanitizeInput(username);
    const rateLimitKey = `signup_${sanitizedEmail}`;
    
    if (!signupRateLimit.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(signupRateLimit.getRemainingTime(rateLimitKey) / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: "destructive"
      });
      return { success: false };
    }

    // Validate inputs
    const emailValidation = validateEmail(sanitizedEmail);
    const passwordValidation = validatePassword(password, true);
    const usernameValidation = validateUsername(sanitizedUsername);

    if (!emailValidation || !passwordValidation.isValid || !usernameValidation.isValid) {
      toast({
        title: "Validation failed",
        description: passwordValidation.message || usernameValidation.message || "Please check your input.",
        variant: "destructive"
      });
      return { success: false };
    }

    setLoading(true);
    signupRateLimit.recordAttempt(rateLimitKey);

    try {
      // Check if username is available using secure function
      const { data: usernameExists } = await supabase
        .rpc('check_username_exists', { username_to_check: sanitizedUsername });

      if (usernameExists) {
        await logSecurityEvent('username_conflict', { 
          attempted_username: sanitizedUsername 
        });
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive"
        });
        return { success: false };
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: { 
          data: { username: sanitizedUsername },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        // Log failed signup attempt for security monitoring
        await logSecurityEvent('signup_failed', { 
          email: sanitizedEmail, 
          error: error.message 
        });

        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.status === 422) {
          toast({
            title: "Registration failed",
            description: "Please check your information and try again, or use the login form if you already have an account.",
            variant: "destructive"
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Password requirements not met",
            description: "Password must be at least 8 characters with uppercase, lowercase, and number.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Signup failed",
            description: "Something went wrong during signup. Please try again.",
            variant: "destructive"
          });
        }
        return { success: false };
      }
      
      if (data && (data.session || data.user)) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to confirm your account.",
        });
        return { success: true, requiresEmailConfirmation: true, email: sanitizedEmail };
      }

      return { success: false };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const rateLimitKey = `reset_${sanitizedEmail}`;
    
    if (!passwordResetRateLimit.canAttempt(rateLimitKey)) {
      const remainingTime = Math.ceil(passwordResetRateLimit.getRemainingTime(rateLimitKey) / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: "destructive"
      });
      return { success: false };
    }

    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return { success: false };
    }
    
    passwordResetRateLimit.recordAttempt(rateLimitKey);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset instructions sent",
        description: "If an account exists with this email, you'll receive password reset instructions. Check your email and spam folder."
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Reset password failed",
        description: "Please check your email address and try again.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signIn,
    signUp,
    resetPassword
  };
};