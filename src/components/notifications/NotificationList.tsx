import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, ChevronDown } from "lucide-react";
import { formatDistanceToNow, subDays } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { UserMark } from "@/components/story/UserMark";
import { EmptyNotifications } from "./EmptyNotifications";

/**
 * The Alerts tab, and the header dropdown behind the bell.
 *
 * There used to be two of these — NotificationList and MobileNotificationList —
 * chosen by a `lg:hidden` / `hidden lg:block` pair on the page. They were the
 * same list twice: identical message parser, identical week/month/earlier
 * grouping, identical collapsibles. Only the sizes differed, and the comment
 * justifying the split claimed the narrow one grouped older items "which the
 * wide one does not", which was not true of either. One responsive
 * implementation, as ProfileContent already argues for.
 *
 * Both copies were also the last big piece of the site still on the
 * pre-redesign palette, including `bg-red-100`/`text-blue-600` chips that
 * belong to no palette this project defines.
 */

const PILL = "rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.04em]";

/**
 * Two formats, because the older rows were written as prose before the
 * pipe-delimited form existed and are still in the table.
 */
const parseMessage = (message: string) => {
  if (message.includes("|")) {
    const parts = message.split("|");
    const propertiesPart = parts.find((p) => p.startsWith("PROPERTIES:"));
    const flavorsPart = parts.find((p) => p.startsWith("FLAVORS:"));
    return {
      username: parts[0] || "",
      productInfo: parts[1] || "",
      isBarista: parts.includes("BARISTA"),
      properties: propertiesPart ? propertiesPart.replace("PROPERTIES:", "").split(",").filter(Boolean) : [],
      flavors: flavorsPart ? flavorsPart.replace("FLAVORS:", "").split(",").filter(Boolean) : [],
    };
  }
  const match = message.match(/^(.+?)\s+liked your test(?:\s+of\s+(.+))?$/);
  return {
    username: match?.[1] ?? "",
    productInfo: match?.[2] ?? (match ? "" : message),
    isBarista: false,
    properties: [] as string[],
    flavors: [] as string[],
  };
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const isLike = notification.type === "like";
  const Icon = isLike ? Heart : MessageCircle;
  const { username, productInfo, isBarista, properties, flavors } = parseMessage(notification.message);

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.milk_test_id) navigate(`/feed?testId=${notification.milk_test_id}`);
    window.dispatchEvent(new Event("lov-close-notifications"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative flex w-full items-start gap-3 border-b border-story-ink/[0.07] px-4 py-3.5 text-left transition-colors last:border-b-0 md:hover:bg-story-cream-2",
        !notification.is_read && "bg-story-green-wash",
      )}
    >
      {/* An unread row earns a mark you can find by scanning the edge, rather
          than by comparing two nearly identical background tints. */}
      {!notification.is_read && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-story-green" />}

      <UserMark name={username} className="h-10 w-10 text-[0.9375rem] sm:h-11 sm:w-11" />

      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block text-[0.9375rem] leading-snug text-story-ink">
          <span className="font-bold">{username}</span>{" "}
          {isLike ? "liked your rating" : "commented on your rating"}
        </span>

        {productInfo && (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.875rem] font-bold text-story-ink" translate="no">
              {productInfo}
            </span>
            {isBarista && <span className={cn(PILL, "bg-story-green text-white")}>Barista</span>}
            {properties.map((p) => (
              <span key={p} className={cn(PILL, "bg-story-ink/[0.06] text-story-muted")}>
                {p.replace(/_/g, " ")}
              </span>
            ))}
            {flavors.map((f) => (
              <span key={f} className={cn(PILL, "bg-story-amber-light text-story-amber-dark")}>
                {f}
              </span>
            ))}
          </span>
        )}

        <span className="block text-[0.75rem] text-story-muted-2">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
          isLike ? "bg-story-amber-light text-story-amber-dark" : "bg-story-blue-light text-story-blue-dark",
        )}
      >
        <Icon className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" />
      </span>
    </button>
  );
};

const Group = ({
  title,
  items,
  onMarkAsRead,
}: {
  title: string;
  items: Notification[];
  onMarkAsRead: (id: string) => void;
}) => {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between bg-story-cream-2 px-4 py-2.5">
          <h3 className="story-kicker text-story-muted-2">{title}</h3>
          <ChevronDown
            className={cn("h-4 w-4 text-story-muted-2 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {items.map((n) => (
          <NotificationItem key={n.id} notification={n} onMarkAsRead={onMarkAsRead} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

/**
 * `variant="page"` lets the list run to its natural height. The 320px scroll
 * window is right inside a dropdown and wrong on a page that already scrolls —
 * it pinned the list into a small box while the rest of the page sat empty.
 */
export function NotificationList({ variant = "dropdown" }: { variant?: "dropdown" | "page" } = {}) {
  const onPage = variant === "page";
  const { notifications, loading, markAsRead } = useNotifications();

  if (loading) {
    return <div className="px-4 py-6 text-center text-[0.9375rem] text-story-muted">Loading notifications…</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="w-full">
        <EmptyNotifications onPage={onPage} />
      </div>
    );
  }

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);
  const at = (n: Notification) => new Date(n.created_at);

  const groups = [
    { title: "Last week", items: notifications.filter((n) => at(n) > sevenDaysAgo) },
    { title: "Last month", items: notifications.filter((n) => at(n) <= sevenDaysAgo && at(n) > thirtyDaysAgo) },
    { title: "Earlier", items: notifications.filter((n) => at(n) <= thirtyDaysAgo) },
  ];

  return (
    <div className="w-full">
      <ScrollArea className={onPage ? "bg-transparent" : "h-80 bg-white"}>
        {groups.map((g) => (
          <Group key={g.title} title={g.title} items={g.items} onMarkAsRead={markAsRead} />
        ))}
      </ScrollArea>
    </div>
  );
}
