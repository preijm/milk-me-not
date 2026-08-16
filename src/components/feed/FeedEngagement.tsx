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
  showComments: _showComments,
  onLike,
  onToggleComments,
  onViewAllResults,
  onEdit
}: FeedEngagementProps) => {
  const [showLikesPopover, setShowLikesPopover] = useState(false);

  const handleLikeClick = () => {
    onLike();
  };


  return (
    <div className="flex items-center justify-between border-t border-story-ink/[0.08] pt-3.5">
      <div className="flex items-center gap-1">
        {/* Like button with count */}
        <Popover open={showLikesPopover} onOpenChange={setShowLikesPopover}>
          <div className="flex items-center">
            {isOwnPost ? (
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likes.length > 0 && setShowLikesPopover(true)}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 font-bold text-story-muted transition-all duration-200 hover:bg-story-green/10 hover:text-story-ink"
                >
                  <Heart className={cn("h-4 w-4", likes.length > 0 && "fill-current text-[#d8453a]")} />
                  <span className="text-sm">{likes.length}</span>
                  <span className="hidden text-sm lg:inline">Likes</span>
                </Button>
              </PopoverTrigger>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={isLikePending}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 font-bold transition-all duration-200",
                  isLiked ? "text-[#d8453a] hover:bg-[#d8453a]/10" : "text-story-muted hover:bg-story-green/10 hover:text-story-ink",
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <PopoverTrigger asChild>
                  <span
                    className={cn("text-sm", likes.length > 0 && "cursor-pointer")}
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
                <span className="hidden text-sm lg:inline">Likes</span>
              </Button>
            )}
          </div>

          {likes.length > 0 && (
            <PopoverContent
              side="top"
              align="start"
              className="w-36 overflow-hidden rounded-xl border border-story-ink/10 bg-white p-0 shadow-lg"
            >
              <div className="border-b border-story-ink/10 bg-story-cream-2 px-3 py-1.5">
                <p className="flex items-center gap-1.5 text-sm font-bold text-story-ink">
                  <Heart className="h-3.5 w-3.5 fill-[#d8453a] text-[#d8453a]" />
                  Liked by
                </p>
              </div>
              <div className="max-h-36 overflow-y-auto py-1">
                {likes.map((like) => (
                  <div key={like.id} className="px-3 py-1.5 text-sm text-story-ink transition-colors hover:bg-story-cream-2">
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
          className="flex items-center gap-2 rounded-full px-3 py-1.5 font-bold text-story-muted transition-all duration-200 hover:bg-story-green/10 hover:text-story-ink"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{commentsCount}</span>
          <span className="hidden text-sm lg:inline">Comments</span>
        </Button>

        {/* View All button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllResults}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 font-bold text-story-muted transition-all duration-200 hover:bg-story-green/10 hover:text-story-ink"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden text-sm lg:inline">View All</span>
        </Button>
      </div>

      {isOwnPost && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 rounded-full border-story-ink/15 p-0 text-story-ink hover:bg-story-green/10"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
