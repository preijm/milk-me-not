import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/scoreFormatter";
import { getTier } from "@/components/story";
import { UserMark } from "@/components/story/UserMark";

interface FeedHeaderProps {
  username?: string;
  createdAt: string;
  rating: number;
  blurred?: boolean;
}

/**
 * The verdict card's byline: who tasted it and when. The score already runs
 * large at the top of the card, so this is a quiet signature, not a second
 * hero — a small tier-coloured figure rather than a badge.
 */
export const FeedHeader = ({ username, createdAt, rating, blurred }: FeedHeaderProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true }).replace("about ", "");
  const tier = getTier(rating);

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
      <span className="story-num flex-shrink-0 text-[0.9375rem]" style={{ color: tier.color }}>
        {formatScore(Number(rating))}
      </span>
    </div>
  );
};
