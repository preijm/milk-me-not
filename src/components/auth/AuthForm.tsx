
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthFormInputs from "./AuthFormInputs";
import AuthFormButtons from "./AuthFormButtons";
import { useAuthForm } from "@/hooks/useAuthForm";

interface AuthFormProps {
  onForgotPassword: () => void;
}

const AuthForm = ({ onForgotPassword }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { loading, handleLogin, handleSignUp } = useAuthForm();
  const { toast } = useToast();
  const location = useLocation();

  // Check for confirmation success in URL or signup success state
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const type = params.get('type');
      
      if (type === 'signup') {
        // User confirmed email - sign them out and show login form
        await supabase.auth.signOut();
        toast({
          title: "Email confirmed!",
          description: "Your account has been verified. Please log in with your credentials.",
        });
        // Clear the hash without causing a page reload
        window.history.replaceState(null, '', window.location.pathname);
        setIsLogin(true); // Ensure we're in login mode
      }
    };
    
    handleEmailConfirmation();
    
    // Check if user was redirected from successful signup
    if (location.state?.signupSuccess) {
      setIsLogin(true); // Switch to login mode
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [toast, location.state]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (!isLogin && password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (emailValidation) {
      setEmailError(emailValidation);
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
    }
    
    // Show validation errors as toast
    if (emailValidation || passwordValidation) {
      toast({
        title: "Please check your input",
        description: emailValidation || passwordValidation,
        variant: "destructive"
      });
      return;
    }
    
    console.log("Form submitted:", isLogin ? "login" : "signup");
    
    if (isLogin) {
      await handleLogin(email, password);
    } else {
      console.log("Calling handleSignUp with:", { email, password, username });
      await handleSignUp({ email, password, username });
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
        {isLogin ? "Welcome Back" : "Join Our Community"}
      </h1>
      <form onSubmit={handleAuth} className="space-y-6">
      <AuthFormInputs
        isLogin={isLogin}
        email={email}
        setEmail={(value) => {
          setEmail(value);
          if (emailError) setEmailError("");
        }}
        password={password}
        setPassword={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError("");
        }}
        username={username}
        setUsername={setUsername}
        emailError={emailError}
        passwordError={passwordError}
      />

      <AuthFormButtons
        isLogin={isLogin}
        loading={loading}
        onForgotPassword={onForgotPassword}
        onToggleMode={() => {
          setIsLogin(!isLogin);
          setUsername("");
          setEmailError("");
          setPasswordError("");
        }}
      />
      </form>
    </>
  );
};

export default AuthForm;
