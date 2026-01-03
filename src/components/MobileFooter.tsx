import { Link, useLocation } from "react-router-dom";
import { Home, Radio, BarChart3, Bell, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";

const MobileFooter = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [resultsUrl, setResultsUrl] = useState('/results');

  // Update results URL from sessionStorage when location changes
  useEffect(() => {
    const storedUrl = sessionStorage.getItem('lastResultsUrl');
    if (storedUrl) {
      setResultsUrl(storedUrl);
    }
  }, [location.pathname]);
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getLinkClass = (path: string) => {
    return isActive(path) 
      ? "font-medium transition-colors text-brand-primary" 
      : "text-gray-600 md:hover:text-gray-900 transition-colors font-medium";
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${getLinkClass("/")}`}
            >
              <Home className="w-6 h-6" />
            </Link>
            <Link 
              to="/feed" 
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${getLinkClass("/feed")}`}
            >
              <Radio className="w-6 h-6" />
            </Link>
            <Link 
              to={resultsUrl} 
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${getLinkClass("/results")}`}
            >
              <BarChart3 className="w-6 h-6" />
            </Link>
            <Link 
              to="/notifications" 
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${getLinkClass("/notifications")}`}
            >
              <div className="relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"
                    aria-label={`${unreadCount} unread notifications`}
                  />
                )}
              </div>
            </Link>
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${getLinkClass("/profile")}`}
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;