import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AddMilkTest = lazy(() => import("@/components/AddMilkTest").then(m => ({ default: m.AddMilkTest })));
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Logo } from "@/components/menu/Logo";
import { PageTitle } from "@/components/menu/PageTitle";
import { DesktopNav } from "@/components/menu/DesktopNav";
import { MenuActions } from "@/components/menu/MenuActions";

const TABLET_BREAKPOINT = 1024;

const MenuBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= TABLET_BREAKPOINT);

  const isMobileOrTablet = !isDesktop;
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';

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

    if (isDesktop) {
      setShowAddTestDialog(true);
    } else {
      navigate('/add');
    }
  };

  return (
    <nav className="bg-white lg:bg-white/5 lg:backdrop-blur-[2px] fixed w-full z-50 border-b lg:border-white/10 border-gray-200/60 shadow-sm lg:shadow-none" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 my-[5px]">
          {/* Mobile/Tablet: Show logo only on home/auth, page title on other pages */}
          <div className="lg:hidden flex-1">
            {(isHomePage || isAuthPage) ? (
              <Logo />
            ) : (
              <PageTitle 
                pathname={location.pathname}
                unreadCount={unreadCount}
                isMobileOrTablet={isMobileOrTablet}
              />
            )}
          </div>
          
          {/* Desktop: Always show logo */}
          <Logo className="hidden lg:flex" />
          
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <DesktopNav pathname={location.pathname} />

            {/* Action buttons (context-dependent) */}
            <MenuActions
              pathname={location.pathname}
              isMobileOrTablet={isMobileOrTablet}
              user={user}
              notifications={notifications}
              unreadCount={unreadCount}
              markAllAsRead={markAllAsRead}
              onAddTest={handleAddTest}
            />
          </div>
        </div>
      </div>
      
      {/* Add Test Dialog */}
      <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-brand-primary">Add New Test</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
            <AddMilkTest />
          </Suspense>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default MenuBar;
