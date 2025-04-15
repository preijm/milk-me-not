import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";
import MenuBar from "@/components/MenuBar";

const Auth = () => {
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
    console.log("Attempting authentication...");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) throw error;
        
        console.log("Login successful");
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
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error.message);
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
    <div className="min-h-screen">
      <MenuBar />
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2144FF] hover:bg-blue-700 text-white"
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
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername("");
              }}
              className="text-[#2144FF] hover:underline"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
