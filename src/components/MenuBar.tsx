import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
import { Bell, Radio, BarChart3, ArrowLeft, Plus, X, Settings, User, Lock, Globe, Smartphone } from "lucide-react";
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
        return 'Get in Touch';
      case '/account':
        return 'Settings';
      default:
        return null;
    }
  };
  const pageTitle = getPageTitle();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  const isProfilePage = location.pathname === '/profile';
  const isNotificationsPage = location.pathname === '/notifications';
  const isFeedPage = location.pathname === '/feed';
  const isProductDetailsPage = location.pathname.startsWith('/product/');
  const isResultsPage = location.pathname === '/results';
  const isAddPage = location.pathname === '/add';
  const isAccountPage = location.pathname === '/account';
  const isAccountNotificationsPage = location.pathname === '/account/notifications';
  const isAccountSecurityPage = location.pathname === '/account/security';
  const isAccountCountryPage = location.pathname === '/account/country';
  const isAccountProfilePage = location.pathname === '/account/profile';
  const isContactPage = location.pathname === '/contact';
  const isAboutPage = location.pathname === '/about';
  const isMobileAppPage = location.pathname === '/mobile-app';
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
  return <nav className="bg-white lg:bg-white/5 lg:backdrop-blur-[2px] fixed w-full z-50 border-b lg:border-white/10 border-gray-200/60 shadow-sm lg:shadow-none">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 my-[5px]">
          {/* Mobile/Tablet: Show logo only on home, page title on other pages */}
          <div className="lg:hidden flex-1">
            {(isHomePage || isAuthPage) ? <Link to="/" className="flex items-center gap-3">
                <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" width="48" height="48" loading="eager" fetchPriority="high" />
                <span className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" translate="no">Milk Me Not</span>
              </Link> : isAddPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Add Test</h1>
              </div> : isNotificationsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
                </div>
              </div> : isFeedPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Feed</h1>
              </div> : isProfilePage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
              </div> : isAccountNotificationsPage && isMobileOrTablet ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
              </div> : isAccountSecurityPage && isMobileOrTablet ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Security</h1>
              </div> : isAccountCountryPage && isMobileOrTablet ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Country</h1>
              </div> : isAccountProfilePage && isMobileOrTablet ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
              </div> : isAccountPage && isMobileOrTablet ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
              </div> : isProductDetailsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Result Details</h1>
              </div> : isResultsPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Results</h1>
              </div> : isMobileAppPage ? <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-primary">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Get the Mobile App</h1>
              </div> : <h1 className="text-gray-800 text-xl font-semibold">{pageTitle}</h1>}
          </div>
          
          {/* Desktop: Always show logo */}
          <Link to="/" className="hidden lg:flex items-center gap-3">
            <img src="/lovable-uploads/9f030b65-074a-4e64-82d9-f0eba7246e1a.png" alt="Milk Me Not Logo" className="h-12 w-12" width="48" height="48" loading="eager" fetchPriority="high" />
            <span className="text-gray-800 text-2xl md:text-4xl font-bold whitespace-nowrap flex items-center" translate="no">Milk Me Not</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-brand-primary font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Home
              </Link>
              <Link to="/feed" className={`transition-colors ${location.pathname === '/feed' ? 'text-brand-primary font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Feed
              </Link>
              <Link to="/results" className={`transition-colors ${location.pathname === '/results' ? 'text-brand-primary font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Results
              </Link>
              <Link to="/about" className={`transition-colors ${location.pathname === '/about' ? 'text-brand-primary font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                About
              </Link>
              <Link to="/contact" className={`transition-colors ${location.pathname === '/contact' ? 'text-brand-primary font-medium' : 'text-gray-700 md:hover:text-gray-900'}`}>
                Contact
              </Link>
            </div>

            {/* Mobile/Tablet: Add test button on results and feed pages, Back button on product details and account, Close button on add page, Settings button on profile */}
            {isProductDetailsPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => {
                // Always use stored Results URL to avoid bfcache showing stale UI
                const lastResultsUrl = sessionStorage.getItem('lastResultsUrl') || '/results';
                navigate(lastResultsUrl);
              }} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {isMobile ? "Back" : "Back to results"}
              </Button> : isAccountNotificationsPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate('/account')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAccountSecurityPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate('/account')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAccountCountryPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate('/account')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAccountProfilePage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate('/account')} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isContactPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAboutPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isMobileAppPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAccountPage && isMobileOrTablet ? <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button> : isAddPage && isMobileOrTablet ? <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full">
                <X className="h-6 w-6" />
              </Button> : (isResultsPage || isFeedPage) && isMobileOrTablet && user ? <Button variant="default" size="sm" onClick={handleAddTest} className="rounded-full h-9 w-9 p-0 bg-brand-primary hover:bg-brand-primary/90">
                <Plus className="h-5 w-5 text-white" />
              </Button> : isNotificationsPage && isMobileOrTablet && notifications.length > 0 && unreadCount > 0 ? <button onClick={markAllAsRead} className="text-sm font-medium whitespace-nowrap text-brand-primary">
                Mark all read
              </button> : isProfilePage && isMobileOrTablet ? <Button variant="ghost" size="icon" onClick={() => navigate('/account')} className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button> : !isMobileOrTablet && <AuthButton />}
          </div>
        </div>
      </div>
      
      {/* Add Test Dialog */}
      <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-brand-primary">Add New Test</DialogTitle>
          </DialogHeader>
          <AddMilkTest />
        </DialogContent>
      </Dialog>
    </nav>;
};
export default MenuBar;