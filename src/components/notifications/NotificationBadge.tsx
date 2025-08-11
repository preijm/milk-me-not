import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "./NotificationList";

export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Open notifications">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only" aria-live="polite" role="status">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
          </span>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs z-10"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background z-50" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
}