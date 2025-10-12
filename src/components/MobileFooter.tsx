import { Link, useLocation } from "react-router-dom";
import { Home, Radio, BarChart3, Bell, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const MobileFooter = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getLinkClass = (path: string) => {
    return isActive(path) 
      ? "font-medium transition-colors" 
      : "text-gray-600 md:hover:text-gray-900 transition-colors font-medium";
  };

  const getLinkStyle = (path: string) => {
    return isActive(path) ? { color: '#00bf63' } : {};
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${getLinkClass("/")}`}
              style={getLinkStyle("/")}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link 
              to="/feed" 
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${getLinkClass("/feed")}`}
              style={getLinkStyle("/feed")}
            >
              <Radio className="w-5 h-5" />
              <span className="text-xs">Feed</span>
            </Link>
            <Link 
              to="/results" 
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${getLinkClass("/results")}`}
              style={getLinkStyle("/results")}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Results</span>
            </Link>
            <Link 
              to="/notifications" 
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${getLinkClass("/notifications")}`}
              style={getLinkStyle("/notifications")}
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"
                    aria-label={`${unreadCount} unread notifications`}
                  />
                )}
              </div>
              <span className="text-xs sm:hidden">Notifs</span>
              <span className="text-xs hidden sm:inline">Notifications</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${getLinkClass("/profile")}`}
              style={getLinkStyle("/profile")}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;