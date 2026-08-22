import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserMark } from "@/components/story/UserMark";

interface FeedHeaderProps {
  username?: string;
  createdAt: string;
  blurred?: boolean;
}

/**
 * The verdict card's byline: who tasted it and when.
 *
 * It used to end with the score again, in tier colour, which put the same
 * number twice on one card — once at display size in the top-left and once
 * here. The docstring already argued the score "runs large at the top of the
 * card"; the figure beneath it disagreed.
 */
export const FeedHeader = ({ username, createdAt, blurred }: FeedHeaderProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true }).replace("about ", "");

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <UserMark name={username} className="h-9 w-9 text-sm" />
        <div className="flex min-w-0 flex-col">
          <span className={cn("truncate text-sm font-bold text-story-ink", blurred && "blur-sm")} translate="no">
            {username}
          </span>
          <span className="text-[0.75rem] font-medium text-story-muted-2">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};
