
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const { loading, handleLogin, handleSignUp } = useAuthForm();
  const { toast } = useToast();
  const location = useLocation();

  // Check for confirmation success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const type = params.get('type');
    
    if (type === 'signup') {
      toast({
        title: "Account created!",
        description: "Your account has been successfully verified. Please log in.",
      });
      // Clear the hash without causing a page reload
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await handleLogin(email, password);
    } else {
      await handleSignUp({ email, password, username });
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      <AuthFormInputs
        isLogin={isLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        username={username}
        setUsername={setUsername}
      />

      <AuthFormButtons
        isLogin={isLogin}
        loading={loading}
        onForgotPassword={onForgotPassword}
        onToggleMode={() => {
          setIsLogin(!isLogin);
          setUsername("");
        }}
      />
    </form>
  );
};

export default AuthForm;
