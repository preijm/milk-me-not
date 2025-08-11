import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell } from "lucide-react";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationDropdownProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function NotificationDropdown({ trigger, className }: NotificationDropdownProps) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <div className="flex items-center gap-2">
      <Bell className="w-4 h-4 opacity-70" aria-hidden="true" />
      <span>Notifications</span>
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="ml-1 h-4 min-w-4 px-1 rounded-full p-0 flex items-center justify-center text-[10px] leading-none"
          aria-label={`${unreadCount} unread notifications`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer">
          {trigger || defaultTrigger}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 backdrop-blur-sm border border-white/20 shadow-xl bg-white rounded-lg overflow-hidden" closeButton={true}>
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <NotificationList />
      </DialogContent>
    </Dialog>
  );
}
