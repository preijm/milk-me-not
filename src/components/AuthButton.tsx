import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const AuthButton = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      console.log("Auth state changed:", session?.user ? "logged in" : "logged out");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = () => {
    if (user) {
      supabase.auth.signOut().then(() => {
        toast({
          title: "Signed out",
          description: "You've been successfully logged out.",
        });
        navigate("/");
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <Button
      onClick={handleAuth}
      className="bg-cream-300 hover:bg-cream-200 text-milk-500"
    >
      {user ? (
        <div className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </div>
      )}
    </Button>
  );
};