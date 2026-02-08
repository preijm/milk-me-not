import { ArrowLeft, Plus, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/AuthButton";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuActionsProps {
  pathname: string;
  isMobileOrTablet: boolean;
  user: User | null;
  notifications: Array<{ id: string }>;
  unreadCount: number;
  markAllAsRead: () => void;
  onAddTest: () => void;
}

export const MenuActions = ({
  pathname,
  isMobileOrTablet,
  user,
  notifications,
  unreadCount,
  markAllAsRead,
  onAddTest,
}: MenuActionsProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const isProductDetailsPage = pathname.startsWith('/product/');
  const isResultsPage = pathname === '/results';
  const isFeedPage = pathname === '/feed';
  const isAddPage = pathname === '/add';
  const isNotificationsPage = pathname === '/notifications';
  const isProfilePage = pathname === '/profile';
  const isAccountPage = pathname === '/account';
  const isAccountNotificationsPage = pathname === '/account/notifications';
  const isAccountSecurityPage = pathname === '/account/security';
  const isAccountCountryPage = pathname === '/account/country';
  const isAccountProfilePage = pathname === '/account/profile';
  const isContactPage = pathname === '/contact';
  const isAboutPage = pathname === '/about';
  const isMobileAppPage = pathname === '/mobile-app';

  // Desktop: Only show AuthButton
  if (!isMobileOrTablet) {
    return <AuthButton />;
  }

  // Product details - Back to results
  if (isProductDetailsPage) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const lastResultsUrl = sessionStorage.getItem('lastResultsUrl') || '/results';
          navigate(lastResultsUrl);
        }}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        {isMobile ? "Back" : "Back to results"}
      </Button>
    );
  }

  // Account sub-pages - Back to account
  if (isAccountNotificationsPage || isAccountSecurityPage || isAccountCountryPage || isAccountProfilePage) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/account')} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    );
  }

  // Pages with simple back navigation
  if (isContactPage || isAboutPage || isMobileAppPage || isAccountPage) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    );
  }

  // Add page - Close button
  if (isAddPage) {
    return (
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10 rounded-full">
        <X className="h-6 w-6" />
      </Button>
    );
  }

  // Results/Feed page - Add test button (for authenticated users)
  if ((isResultsPage || isFeedPage) && user) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={onAddTest}
        className="rounded-full h-9 w-9 p-0 bg-brand-primary hover:bg-brand-primary/90"
      >
        <Plus className="h-5 w-5 text-white" />
      </Button>
    );
  }

  // Notifications page - Mark all read button
  if (isNotificationsPage && notifications.length > 0 && unreadCount > 0) {
    return (
      <button onClick={markAllAsRead} className="text-sm font-medium whitespace-nowrap text-brand-primary">
        Mark all read
      </button>
    );
  }

  // Profile page - Settings button
  if (isProfilePage) {
    return (
      <Button variant="ghost" size="icon" onClick={() => navigate('/account')}>
        <Settings className="!h-5 !w-5" />
      </Button>
    );
  }

  return null;
};
