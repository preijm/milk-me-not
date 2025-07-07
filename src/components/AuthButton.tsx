import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, Settings, ChevronDown, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export const AuthButton = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
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
    return <Button onClick={handleAuth} className="w-full" style={{ 
      backgroundColor: '#2144FF', 
      color: 'white' 
    }}>
      <LogIn className="w-4 h-4 mr-2" />
      Login here
    </Button>;
  }
  
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm transition-all duration-300 pl-2 pr-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/90 to-blue-500/90 flex items-center justify-center text-white font-medium shadow-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <span>Account</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-lg border-white/20 shadow-lg rounded-xl p-1">
        <DropdownMenuItem onClick={() => navigate('/add')} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors cursor-pointer">
          <Plus className="w-4 h-4 opacity-70" />
          <span>Add Test</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-results')} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors cursor-pointer">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>My Results</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/account')} className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors cursor-pointer">
          <Settings className="w-4 h-4 opacity-70" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => {
        await supabase.auth.signOut();
        navigate('/');
        toast({
          title: "Signed out successfully",
          duration: 3000
        });
      }} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer mt-1">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};

export default AuthButton;
