import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Bell, ChevronDown } from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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

  // Parse the message: supports two formats:
  // New format: "Username|ProductInfo|BARISTA|PROPERTIES:prop1,prop2|FLAVORS:flavor1,flavor2"
  // Old format: "Username liked your test of ProductName"
  const parseMessage = (message: string) => {
    if (message.includes('|')) {
      // New format with pipe-separated values
      const parts = message.split('|');
      const username = parts[0] || '';
      const productInfo = parts[1] || '';
      const isBarista = parts.includes('BARISTA');
      
      const propertiesPart = parts.find(p => p.startsWith('PROPERTIES:'));
      const properties = propertiesPart ? propertiesPart.replace('PROPERTIES:', '').split(',').filter(Boolean) : [];
      
      const flavorsPart = parts.find(p => p.startsWith('FLAVORS:'));
      const flavors = flavorsPart ? flavorsPart.replace('FLAVORS:', '').split(',').filter(Boolean) : [];
      
      return { username, productInfo, isBarista, properties, flavors };
    } else {
      // Old format - extract username and product from text
      const match = message.match(/^(.+?)\s+liked your test(?:\s+of\s+(.+))?$/);
      if (match) {
        return {
          username: match[1] || '',
          productInfo: match[2] || '',
          isBarista: false,
          properties: [],
          flavors: []
        };
      }
      // Fallback
      return { username: '', productInfo: message, isBarista: false, properties: [], flavors: [] };
    }
  };

  const { username, productInfo, isBarista, properties, flavors } = parseMessage(notification.message);
  
  return (
    <div 
      className={cn(
        "relative p-3 border-b border-border/50 md:hover:bg-muted/50 cursor-pointer transition-colors",
        !notification.is_read && "bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Badge variant="category" className="w-8 h-8 rounded-full flex items-center justify-center p-0 font-semibold text-sm flex-shrink-0">
          {username.charAt(0).toUpperCase() || 'U'}
        </Badge>
        <div className="flex-1 min-w-0 space-y-1">
          <p className={cn("text-sm text-foreground", !notification.is_read && "font-semibold")}> 
            <span className="font-semibold">{username}</span>
            {' '}
            {notification.type === 'like' ? 'liked your test' : 'commented on your test'}
          </p>
          
          {productInfo && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm text-foreground font-semibold">{productInfo}</span>
              {isBarista && (
                <Badge variant="barista" className="text-xs">Barista</Badge>
              )}
              {properties.map((property) => (
                <Badge key={property} variant="category" className="text-xs">
                  {property.replace(/_/g, ' ')}
                </Badge>
              ))}
              {flavors.map((flavor) => (
                <Badge key={flavor} variant="flavor" className="text-xs capitalize">
                  {flavor}
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className={cn(
          "rounded-full p-2 flex-shrink-0",
          notification.type === 'like' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}>
          <IconComponent className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function NotificationList() {
  const { notifications, loading, markAsRead } = useNotifications();
  const [lastWeekOpen, setLastWeekOpen] = useState(true);
  const [lastMonthOpen, setLastMonthOpen] = useState(true);
  const [earlierOpen, setEarlierOpen] = useState(true);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  // Group notifications by time period
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);
  
  const lastWeekNotifications = notifications.filter(n => new Date(n.created_at) > sevenDaysAgo);
  const lastMonthNotifications = notifications.filter(n => {
    const date = new Date(n.created_at);
    return date <= sevenDaysAgo && date > thirtyDaysAgo;
  });
  const earlierNotifications = notifications.filter(n => new Date(n.created_at) <= thirtyDaysAgo);

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
          <div className="pt-5">
            {lastWeekNotifications.length > 0 && (
              <Collapsible open={lastWeekOpen} onOpenChange={setLastWeekOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Week</h3>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", lastWeekOpen && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {lastWeekNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {lastMonthNotifications.length > 0 && (
              <Collapsible open={lastMonthOpen} onOpenChange={setLastMonthOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Month</h3>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", lastMonthOpen && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {lastMonthNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {earlierNotifications.length > 0 && (
              <Collapsible open={earlierOpen} onOpenChange={setEarlierOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Earlier</h3>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", earlierOpen && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {earlierNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
