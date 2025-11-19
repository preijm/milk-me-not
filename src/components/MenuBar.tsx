import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
import { Bell, Radio, BarChart3, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddMilkTest } from "@/components/AddMilkTest";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
const TABLET_BREAKPOINT = 1024; // Desktop starts at 1024px

const MenuBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead
  } = useNotifications();
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= TABLET_BREAKPOINT);
  const isMobile = useIsMobile();

  // Track screen size to determine if we should use dialog or navigate
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= TABLET_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const handleAddTest = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // On mobile/tablet, navigate to /add page
    // On desktop, open dialog
    if (isDesktop) {
      setShowAddTestDialog(true);
    } else {
      navigate('/add');
    }
  };
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/notifications':
        return null;
      // Handled separately for notifications
      case '/feed':
        return null;
      // Handled separately for feed
      case '/results':
        return 'Results';
      case '/profile':
        return 'Profile';
      case '/about':
        return 'About';
      case '/contact':
        return 'Contact';
      case '/wishlist':
        return 'Wishlist';
      case '/account':
        return 'Settings';
      default:
        return null;
    }
  };
  const pageTitle = getPageTitle();
  const isHomePage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';
  const isNotificationsPage = location.pathname === '/notifications';
  const isFeedPage = location.pathname === '/feed';
  const isProductDetailsPage = location.pathname.startsWith('/product/');
  const isResultsPage = location.pathname === '/results';
  const isAddPage = location.pathname === '/add';
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  return <nav className="bg-white lg:bg-white/5 lg:backdrop-blur-[2px] fixed w-full z-50 border-b lg:border-white/10 border-gray-200/60 shadow-sm lg:shadow-none">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 my-[5px]">
          {/* Mobile/Tablet: Show logo only on home, page title on other pages */}
          <div className="lg:hidden flex-1">
            {isHomePage ? <Link to="/" className="flex items-center gap-3">
                <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" />
                <span className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" translate="no">Milk Me Not</span>
              </Link> : isAddPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#00bf63'
            }}>
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Add Test</h1>
              </div> : isNotificationsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#00bf63'
            }}>
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
                </div>
              </div> : isFeedPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#00bf63'
            }}>
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Feed</h1>
              </div> : isProductDetailsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#00bf63'
            }}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Result Details</h1>
              </div> : isResultsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{
              backgroundColor: '#00bf63'
            }}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Results</h1>
              </div> : <h1 className="text-gray-800 text-xl font-semibold">{pageTitle}</h1>}
          </div>
          
          {/* Desktop: Always show logo */}
          <Link to="/" className="hidden lg:flex items-center gap-3">
            <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" />
            <span className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" translate="no">Milk Me Not</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-[#00bf63] font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Home
              </Link>
              <Link to="/feed" className={`transition-colors ${location.pathname === '/feed' ? 'text-[#00bf63] font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Feed
              </Link>
              <Link to="/results" className={`transition-colors ${location.pathname === '/results' ? 'text-[#00bf63] font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Results
              </Link>
              <Link to="/about" className={`transition-colors ${location.pathname === '/about' ? 'text-[#00bf63] font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                About
              </Link>
              <Link to="/contact" className={`transition-colors ${location.pathname === '/contact' ? 'text-[#00bf63] font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Contact
              </Link>
            </div>

            {/* Mobile/Tablet: Add test button on results and feed pages, Back button on product details, Close button on add page */}
            {isProductDetailsPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate('/results')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {isMobile ? "Back" : "Back to results"}
              </Button> : isAddPage && isMobileOrTablet ? <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full">
                <X className="h-6 w-6" />
              </Button> : (isResultsPage || isFeedPage) && isMobileOrTablet && user ? <Button variant="default" size="sm" onClick={handleAddTest} className="rounded-full h-9 w-9 p-0" style={{
            backgroundColor: '#00bf63'
          }}>
                <Plus className="h-5 w-5 text-white" />
              </Button> : isNotificationsPage && isMobileOrTablet && notifications.length > 0 && unreadCount > 0 ? <button onClick={markAllAsRead} className="text-sm font-medium whitespace-nowrap" style={{
            color: '#00bf63'
          }}>
                Mark all read
              </button> : !isMobileOrTablet && <AuthButton />}
          </div>
        </div>
      </div>
      
      {/* Add Test Dialog */}
      <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#00bf63]">Add New Test</DialogTitle>
          </DialogHeader>
          <AddMilkTest />
        </DialogContent>
      </Dialog>
    </nav>;
};
export default MenuBar;