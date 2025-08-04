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
    <div className="flex items-center gap-2 relative">
      <Bell className="w-4 h-4 opacity-70" />
      <span>Notifications</span>
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs absolute -top-1 -right-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors cursor-pointer">
          {trigger || defaultTrigger}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <NotificationList />
      </DialogContent>
    </Dialog>
  );
}