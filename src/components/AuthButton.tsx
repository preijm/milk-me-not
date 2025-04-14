
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
        className="bg-blue-600 text-white hover:bg-blue-700"
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
          className="bg-gray-50 hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              {user.email?.[0].toUpperCase()}
            </div>
            Account
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate('/account')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-results')}>
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
          className="text-red-600"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
