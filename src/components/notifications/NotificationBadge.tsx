import { Bell } from "lucide-react";

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
            <div 
              className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background z-10"
              aria-label={`${unreadCount} unread notifications`}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background z-50" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
}