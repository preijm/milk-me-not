import React from "react";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import { Bell } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "@/components/notifications/NotificationList";

const Notifications = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 sm:pb-8">
          <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-8 relative z-10">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00bf63' }}>
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <NotificationList />
            </div>
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};

export default Notifications;
