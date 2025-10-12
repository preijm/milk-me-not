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
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Badge variant="category" className="w-9 h-9 rounded-full flex items-center justify-center p-0 font-semibold flex-shrink-0">
          {username?.charAt(0).toUpperCase() || 'U'}
        </Badge>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={cn("font-semibold text-foreground", blurred && "blur-sm")} translate="no">
            {username}
          </span>
          <Badge variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </Badge>
        </div>
      </div>
      <Badge variant={getScoreBadgeVariant(Number(rating))} className="flex-shrink-0">
        {formatScore(Number(rating))}
      </Badge>
    </div>
  );
};
