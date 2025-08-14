import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Bell, CheckCheck, X } from "lucide-react";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
interface NotificationDropdownProps {
  trigger?: React.ReactNode;
  className?: string;
  variant?: 'button' | 'menu';
}

export function NotificationDropdown({ trigger, className, variant = 'button' }: NotificationDropdownProps) {
  const { unreadCount, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    // Allow other parts of the app to open/close the notifications dialog
    window.addEventListener("lov-open-notifications", openHandler as EventListener);
    window.addEventListener("lov-close-notifications", closeHandler as EventListener);
    return () => {
      window.removeEventListener("lov-open-notifications", openHandler as EventListener);
      window.removeEventListener("lov-close-notifications", closeHandler as EventListener);
    };
  }, []);

  const defaultTrigger = (
    <div className="relative flex items-center gap-2 w-full">
      <Bell className="w-4 h-4 opacity-70" aria-hidden="true" />
      <span className="text-sm">Notifications</span>
      {unreadCount > 0 && (
        <span className="ml-1 relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
        </span>
      )}
      <span className="sr-only" aria-live="polite" role="status">
        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'menu' ? (
          <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer w-full", className)}>
            {trigger || defaultTrigger}
          </div>
        ) : (
          <Button variant="ghost" size="sm" className={cn("relative flex items-center gap-2 rounded-lg px-3 py-2.5", className)}>
            {trigger || defaultTrigger}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 backdrop-blur-sm border border-white/20 shadow-xl bg-white rounded-lg overflow-hidden" closeButton={false}>
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background">
          <h3 className="font-semibold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="h-5 min-w-5 px-1 rounded-full p-0 flex items-center justify-center text-xs leading-none"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={markAllAsRead}
                aria-label="Mark all notifications as read"
                className="h-8 w-8"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close notifications" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </div>
        <NotificationList />
      </DialogContent>
    </Dialog>
  );
}
