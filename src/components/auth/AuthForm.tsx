
import React, { useState } from "react";

import AuthFormInputs from "./AuthFormInputs";
import AuthFormButtons from "./AuthFormButtons";
import { useAuthOperations } from "@/hooks/auth/useAuthOperations";
import { sanitizeInput } from "@/lib/security";

interface AuthFormProps {
  onForgotPassword: () => void;
  isEmailConfirmed?: boolean;
  onEmailConfirmedDismiss?: () => void;
  onEmailPending?: (email: string) => void;
  /** Owned by the page, so the copy beside the form matches the mode. */
  isLogin: boolean;
  onToggleMode: () => void;
}

const AuthForm = ({
  onForgotPassword,
  isEmailConfirmed,
  onEmailConfirmedDismiss,
  onEmailPending,
  isLogin,
  onToggleMode,
}: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  const { loading, signIn, signUp } = useAuthOperations();

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

    // The form is noValidate so blank fields surface in the same red inline
    // pattern as a bad password, rather than a native browser tooltip.
    let blank = false;
    if (!isLogin && !sanitizedUsername) {
      setUsernameError("Pick a username — it goes on your ratings");
      blank = true;
    }
    if (!sanitizedEmail) {
      setEmailError("We need an email address");
      blank = true;
    }
    if (!password) {
      setPasswordError(isLogin ? "Enter your password" : "Choose a password, at least 6 characters");
      blank = true;
    }
    if (blank) return;
    
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
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-story-green-wash p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-story-green text-story-ink">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <p className="flex-1 text-[0.875rem] font-medium leading-snug text-story-green-dark">
            Email confirmed. Log in and your first rating is waiting.
          </p>
          <button
            type="button"
            onClick={onEmailConfirmedDismiss}
            aria-label="Dismiss"
            className="text-story-green-dark/60 transition-colors hover:text-story-green-dark"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <form onSubmit={handleAuth} noValidate className="flex flex-col gap-6">
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
            onToggleMode();
            setUsername("");
            clearErrors();
          }}
        />
      </form>
    </>
  );
};

export default AuthForm;
