import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Bell } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

function NotificationItem({ notification, onMarkAsRead }: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  const IconComponent = notification.type === 'like' ? Heart : MessageCircle;
  const navigate = useNavigate();
  
  const handleClick = () => {
    onMarkAsRead(notification.id);
    // Navigate to the feed page with the specific test ID
    if (notification.milk_test_id) {
      navigate(`/feed?testId=${notification.milk_test_id}`);
    }
    // Close the notifications dialog after navigating
    window.dispatchEvent(new Event("lov-close-notifications"));
  };
  
  return (
    <div 
      className={cn(
        "relative p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
        !notification.is_read && "bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-2 flex-shrink-0",
          notification.type === 'like' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm text-foreground", !notification.is_read && "font-semibold")}> 
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationList() {
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="w-full">
      
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground bg-background">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
          <p className="text-xs mt-1">You'll see likes and comments here</p>
        </div>
      ) : (
        <ScrollArea className="h-80 bg-background">
          <div className="max-h-none">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
