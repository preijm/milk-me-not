
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus, Lock } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetInProgress, setResetInProgress] = useState(false);
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
        if (error) {
          toast({
            title: "Login failed",
            description: "Incorrect email or password",
            variant: "destructive"
          });
          throw error;
        }
        console.log("Login successful");
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in."
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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account."
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setResetInProgress(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      // Always show success message, even if email doesn't exist (security best practice)
      toast({
        title: "Reset instructions sent",
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
      setShowResetDialog(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      // Generic error message to avoid revealing account existence
      toast({
        title: "Unable to process request",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setResetInProgress(false);
    }
  };

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="flex items-center justify-center min-h-screen">
          <div className="container max-w-md mx-auto px-4 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              <h1 className="text-3xl font-bold text-center mb-8 text-[#00BF63]">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              
              <form onSubmit={handleAuth} className="space-y-6">
                {!isLogin && (
                  <div>
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
                  </div>
                )}
                
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
                  />
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowResetDialog(true)}
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
              </form>

              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setUsername("");
                }}
                className="mt-6 text-center w-full text-[#00BF63] hover:text-emerald-700 transition-colors"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="bg-white/80 border-black/20 backdrop-blur-sm rounded-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                disabled={resetInProgress}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleForgotPassword}
                disabled={resetInProgress}
                style={{
                  backgroundColor: '#2144FF',
                  color: 'white'
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                {resetInProgress ? "Sending..." : "Send Instructions"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
