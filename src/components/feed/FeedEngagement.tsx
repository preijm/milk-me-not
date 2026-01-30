import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, MessageCircle, BarChart3, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Like {
  id: string;
  user_id: string;
  username?: string;
}

interface FeedEngagementProps {
  likes: Like[];
  commentsCount: number;
  isLiked: boolean;
  isOwnPost: boolean;
  isLikePending: boolean;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  onViewAllResults: () => void;
  onEdit: () => void;
}

export const FeedEngagement = ({
  likes,
  commentsCount,
  isLiked,
  isOwnPost,
  isLikePending,
  showComments,
  onLike,
  onToggleComments,
  onViewAllResults,
  onEdit
}: FeedEngagementProps) => {
  const [showLikesPopover, setShowLikesPopover] = useState(false);

  const handleLikeClick = () => {
    onLike();
  };

  const handleShowLikes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likes.length > 0) {
      setShowLikesPopover(true);
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <div className="flex items-center gap-2">
        {/* Like button with count */}
        <Popover open={showLikesPopover} onOpenChange={setShowLikesPopover}>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLikeClick}
              disabled={isLikePending}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all duration-200",
                isLiked 
                  ? "text-destructive hover:bg-destructive/10" 
                  : "hover:bg-muted"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <PopoverTrigger asChild>
                <span 
                  className={cn(
                    "text-sm",
                    likes.length > 0 && "cursor-pointer"
                  )}
                  onClick={(e) => {
                    if (likes.length > 0) {
                      e.stopPropagation();
                      setShowLikesPopover(true);
                    }
                  }}
                >
                  {likes.length}
                </span>
              </PopoverTrigger>
              <span className="text-sm hidden lg:inline">Likes</span>
            </Button>
          </div>
          
          {likes.length > 0 && (
            <PopoverContent 
              side="top" 
              align="start"
              className="p-0 w-56 bg-card border border-border shadow-xl rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-muted/50 border-b border-border">
                <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive fill-destructive" />
                  Liked by
                </p>
              </div>
              <div className="py-2 max-h-48 overflow-y-auto">
                {likes.map(like => (
                  <div 
                    key={like.id} 
                    className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {like.username}
                  </div>
                ))}
              </div>
            </PopoverContent>
          )}
        </Popover>
        
        {/* Comments button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleComments}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-muted transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{commentsCount}</span>
          <span className="text-sm hidden lg:inline">Comments</span>
        </Button>
        
        {/* View All button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAllResults}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-muted transition-all duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm hidden lg:inline">View All</span>
        </Button>
      </div>

      {isOwnPost && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="rounded-full h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
