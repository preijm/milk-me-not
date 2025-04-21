
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  onForgotPassword: () => void;
}

const AuthForm = ({ onForgotPassword }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast({
            title: "Login failed",
            description: "Incorrect email or password",
            variant: "destructive",
          });
          throw error;
        }
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        navigate("/dashboard");
      } else {
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

        // Fix: Only send username in the metadata to match the database schema
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              username 
            } 
          }
        });
        
        if (error) throw error;
        toast({
          title: "Account created!",
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

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      {!isLogin && (
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required={!isLogin}
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Username can only contain letters, numbers, underscores, and hyphens"
          className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
        />
      )}

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        showPasswordToggle
        className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
      />

      {isLogin && (
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-[#9F9EA1] hover:text-[#8E9196] transition-colors text-right w-full"
        >
          Forgot password?
        </button>
      )}

      <Button
        type="submit"
        className="w-full"
        style={{
          backgroundColor: '#2144FF',
          color: 'white'
        }}
        disabled={loading}
      >
        {loading ? (
          "Loading..."
        ) : isLogin ? (
          <div className="flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </div>
        )}
      </Button>

      <button
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setUsername("");
        }}
        className="mt-6 text-center w-full text-[#00BF63] hover:text-emerald-700 transition-colors"
      >
        {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </form>
  );
};

export default AuthForm;
