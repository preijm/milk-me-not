import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border/50">
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLike}
                disabled={isLikePending}
                className={cn(
                  "flex items-center space-x-1 px-2 py-1.5 rounded-full transition-all duration-200",
                  isLiked ? "text-red-500 bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span className="font-semibold text-sm">{likes.length}</span>
                <span className="text-xs hidden sm:inline">Likes</span>
              </Button>
            </TooltipTrigger>
            {likes.length > 0 && (
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">Liked by:</p>
                  {likes.map(like => (
                    <p key={like.id} className="text-sm">{like.username}</p>
                  ))}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleComments}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-semibold text-sm">{commentsCount}</span>
          <span className="text-xs hidden sm:inline">Comments</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAllResults}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">View All</span>
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
