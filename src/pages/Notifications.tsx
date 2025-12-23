import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { ArrowLeft, Bell } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/notifications/NotificationList";
import { MobileNotificationList } from "@/components/notifications/MobileNotificationList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead
  } = useNotifications();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Check if device is mobile or tablet (up to 1024px)
  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;

  // Mobile/Tablet full-screen layout
  if (isMobileOrTablet) {
    return <div className="min-h-screen bg-white">
        <MenuBar />
        <div className="pt-14 pb-20 min-h-screen">
          <div className="bg-white">
            <MobileNotificationList />
          </div>
        </div>
        <MobileFooter />
      </div>;
  }

  // Desktop layout
  return <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-brand-primary">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
                    {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
                  </div>
                </div>
                {notifications.length > 0 && unreadCount > 0 && <button onClick={markAllAsRead} className="text-sm font-medium md:hover:opacity-80 transition-opacity text-brand-primary">
                    Mark all read
                  </button>}
              </div>
              
              <NotificationList />
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>;
};
export default Notifications;