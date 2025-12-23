
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AuthFormInputs from "./AuthFormInputs";
import AuthFormButtons from "./AuthFormButtons";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import { sanitizeInput } from "@/lib/security";

interface AuthFormProps {
  onForgotPassword: () => void;
  isEmailConfirmed?: boolean;
  onEmailConfirmedDismiss?: () => void;
  onEmailPending?: (email: string) => void;
}

const AuthForm = ({ 
  onForgotPassword, 
  isEmailConfirmed, 
  onEmailConfirmedDismiss,
  onEmailPending 
}: AuthFormProps) => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  const { loading, signIn, signUp } = useAuthOperations();
  const { toast } = useToast();

  // Check if we should start in signup mode based on location state
  useEffect(() => {
    const state = location.state as { mode?: string } | null;
    if (state?.mode === 'signup') {
      setIsLogin(false);
    }
  }, [location]);

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setUsernameError("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedUsername = sanitizeInput(username);
    
    if (isLogin) {
      const result = await signIn(sanitizedEmail, password);
      if (!result.success) {
        setEmailError("Please check your credentials");
      }
    } else {
      const result = await signUp({ 
        email: sanitizedEmail, 
        password, 
        username: sanitizedUsername 
      });
      
      if (result.success && result.requiresEmailConfirmation && onEmailPending) {
        onEmailPending(result.email);
      } else if (!result.success) {
        // Set appropriate field errors based on the failure
        setEmailError("Please check your information");
      }
    }
  };

  return (
    <>
      {isEmailConfirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-emerald-800 font-medium">Email verified successfully!</p>
              <p className="text-emerald-700 text-sm">You can now log in with your credentials.</p>
            </div>
            <button
              type="button"
              onClick={onEmailConfirmedDismiss}
              className="text-emerald-500 hover:text-emerald-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-8 text-brand-primary">
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
          setUsername={(value) => {
            setUsername(value);
            if (usernameError) setUsernameError("");
          }}
          emailError={emailError}
          passwordError={passwordError}
          usernameError={usernameError}
        />

        <AuthFormButtons
          isLogin={isLogin}
          loading={loading}
          onForgotPassword={onForgotPassword}
          onToggleMode={() => {
            setIsLogin(!isLogin);
            setUsername("");
            clearErrors();
          }}
        />
      </form>
    </>
  );
};

export default AuthForm;
