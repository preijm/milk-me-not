import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";

interface FeedHeaderProps {
  username?: string;
  createdAt: string;
  rating: number;
  blurred?: boolean;
}

export const FeedHeader = ({ username, createdAt, rating, blurred }: FeedHeaderProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true }).replace('about ', '');
  
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Badge variant="category" className="w-9 h-9 rounded-full flex items-center justify-center p-0 font-semibold flex-shrink-0">
          {username?.charAt(0).toUpperCase() || 'U'}
        </Badge>
        <div className="flex flex-col gap-1 min-w-0">
          <span className={cn("font-semibold text-foreground", blurred && "blur-sm")} translate="no">
            {username}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-sm">{timeAgo}</span>
          </div>
        </div>
      </div>
      <Badge variant={getScoreBadgeVariant(Number(rating))} className="flex-shrink-0">
        {formatScore(Number(rating))}
      </Badge>
    </div>
  );
};
