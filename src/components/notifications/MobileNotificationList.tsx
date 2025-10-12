import { Heart, MessageCircle, Bell, ChevronDown } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
function NotificationItem({
  notification,
  onMarkAsRead
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.milk_test_id) {
      navigate(`/feed?testId=${notification.milk_test_id}`);
    }
    window.dispatchEvent(new Event("lov-close-notifications"));
  };

  // Extract username from message (e.g., "Ilva liked your test" -> "Ilva")
  const getUsername = (message: string) => {
    const match = message.match(/^(\w+)/);
    return match ? match[1] : "U";
  };
  const getInitials = (message: string) => {
    const username = getUsername(message);
    return username.charAt(0).toUpperCase();
  };

  // Generate consistent color based on username
  const getAvatarColor = (message: string) => {
    const username = getUsername(message);
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };
  return <div className={cn("relative flex items-start gap-3 p-4 border-b cursor-pointer transition-colors", !notification.is_read && "bg-blue-50/50")} onClick={handleClick}>
      {/* Blue indicator for unread */}
      {!notification.is_read && <div className="absolute left-0 top-0 bottom-0 w-1" style={{
      backgroundColor: '#2144ff'
    }} />}
      
      {/* Avatar */}
      <Avatar className={cn("h-12 w-12 flex-shrink-0", getAvatarColor(notification.message))}>
        <AvatarFallback className="text-white font-semibold">
          {getInitials(notification.message)}
        </AvatarFallback>
      </Avatar>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{getUsername(notification.message)}</span>
          {' '}
          {notification.message.substring(getUsername(notification.message).length)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true
          }).replace('about ', '')}
          </p>
          {!notification.is_read && <div className="w-2 h-2 rounded-full bg-blue-600" />}
        </div>
      </div>
      
      {/* Icon based on notification type */}
      <div className={cn("flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center", notification.type === 'like' ? 'bg-pink-100' : 'bg-blue-100')}>
        {notification.type === 'like' ? <Heart className="h-6 w-6 text-pink-600" /> : <MessageCircle className="h-6 w-6 text-blue-600" />}
      </div>
      
      {/* Menu button */}
      
    </div>;
}
export function MobileNotificationList() {
  const { notifications, loading } = useNotifications();
  const [recentOpen, setRecentOpen] = useState(true);
  const [earlierOpen, setEarlierOpen] = useState(true);
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>;
  }
  if (notifications.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
        <p className="text-xs mt-1">You'll see likes and comments here</p>
      </div>;
  }

  // Group notifications by recency
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const recentNotifications = notifications.filter(n => new Date(n.created_at) > sevenDaysAgo);
  const earlierNotifications = notifications.filter(n => new Date(n.created_at) <= sevenDaysAgo);
  return <div className="w-full">
      {recentNotifications.length > 0 && (
        <Collapsible open={recentOpen} onOpenChange={setRecentOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="px-4 py-3 bg-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent</h3>
              <ChevronDown className={cn("h-4 w-4 text-gray-600 transition-transform", recentOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {recentNotifications.map(notification => <NotificationItem key={notification.id} notification={notification} onMarkAsRead={() => {}} />)}
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {earlierNotifications.length > 0 && (
        <Collapsible open={earlierOpen} onOpenChange={setEarlierOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="px-4 py-3 bg-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Earlier</h3>
              <ChevronDown className={cn("h-4 w-4 text-gray-600 transition-transform", earlierOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {earlierNotifications.map(notification => <NotificationItem key={notification.id} notification={notification} onMarkAsRead={() => {}} />)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>;
}