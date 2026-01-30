import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn, Settings, ChevronDown, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

export const AuthButton = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();

  const handleAuth = () => {
    if (user) {
      navigate('/account');
    } else {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  // Don't show loading state to prevent flash - just render the appropriate button
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Button 
      onClick={handleAuth} 
      className={`text-white shadow-lg md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group bg-brand-secondary hover:bg-brand-secondary/90 ${isMobile ? "px-3" : "w-full"}`}
    >
      <LogIn className={`${isMobile ? "w-4 h-4" : "w-6 h-6 mr-2"} md:group-hover:rotate-12 transition-transform duration-300`} />
      {isMobile ? "Login" : "Login here"}
    </Button>;
  }
  
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/10 md:hover:bg-white/20 text-gray-800 border-white/20 backdrop-blur-sm transition-all duration-300 pl-2 pr-3">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Badge 
                variant="category" 
                className="w-8 h-8 rounded-full flex items-center justify-center p-0 font-medium text-sm"
              >
                {user.email?.[0].toUpperCase()}
              </Badge>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"
                  aria-hidden="true"
                />
              )}
            </div>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-lg border-white/20 shadow-lg rounded-xl p-1">
        <DropdownMenuItem onClick={() => navigate('/add')} className="flex items-center gap-2 rounded-lg px-3 py-2.5 md:hover:bg-emerald-50 transition-colors cursor-pointer">
          <Plus className="w-4 h-4 opacity-70" />
          <span>Add Test</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/results', { state: { myResultsOnly: true } })} className="flex items-center gap-2 rounded-lg px-3 py-2.5 md:hover:bg-emerald-50 transition-colors cursor-pointer">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>My Tests</span>
        </DropdownMenuItem>
        
        <NotificationDropdown variant="menu" />
        
        <DropdownMenuItem onClick={() => navigate('/account')} className="flex items-center gap-2 rounded-lg px-3 py-2.5 md:hover:bg-emerald-50 transition-colors cursor-pointer">
          <Settings className="w-4 h-4 opacity-70" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-red-600 md:hover:bg-red-50 transition-colors cursor-pointer mt-1">
          <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};

export default AuthButton;
