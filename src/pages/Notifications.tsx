import { useNotifications } from "@/hooks/useNotifications";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { NotificationList } from "@/components/notifications/NotificationList";

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <StoryAppLayout
      kicker="Your inbox"
      title="Who replied,"
      accent="who agreed."
      lede={
        unreadCount > 0
          ? `${unreadCount} thing${unreadCount === 1 ? "" : "s"} you have not read yet.`
          : "Replies, likes and news about the milks you rated."
      }
    >
      <div className="story-hairline overflow-hidden rounded-3xl bg-white">
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="flex justify-end border-b border-story-ink/[0.07] px-5 py-3">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[0.8125rem] font-bold text-story-green-dark transition-opacity md:hover:opacity-70"
            >
              Mark all read
            </button>
          </div>
        )}
        <NotificationList variant="page" />
      </div>
    </StoryAppLayout>
  );
};

export default Notifications;
