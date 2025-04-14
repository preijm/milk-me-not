
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      navigate('/account');
    } else {
      navigate("/auth");
    }
  };

  if (!user) {
    return (
      <Button 
        onClick={handleAuth}
        variant="outline"
        className="bg-gradient-to-r from-emerald-500/80 to-blue-500/80 text-white hover:from-emerald-600/80 hover:to-blue-600/80 border-white/20 backdrop-blur-sm transition-all duration-300"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Get started
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/80 to-blue-500/80 flex items-center justify-center mr-2 text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            Account
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-lg border-white/20 shadow-lg">
        <DropdownMenuItem onClick={() => navigate('/account')} className="hover:bg-emerald-50 transition-colors">
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-results')} className="hover:bg-emerald-50 transition-colors">
          My Results
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/');
            toast({
              title: "Signed out successfully",
              duration: 3000,
            });
          }}
          className="text-red-600 hover:bg-red-50 transition-colors"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
