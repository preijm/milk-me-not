import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, MessageCircle, Edit3 } from "lucide-react";
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
  onEdit: () => void;
  /** Drop the dividing rule and tighten up, for an inline footer row. */
  bare?: boolean;
  className?: string;
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
  onEdit,
  bare = false,
  className,
}: FeedEngagementProps) => {
  const [showLikesPopover, setShowLikesPopover] = useState(false);

  const handleLikeClick = () => {
    onLike();
  };

  /**
   * A zero is not worth the width it costs on a phone.
   *
   * The mobile card gives this row whatever is left of a 195px column after
   * the byline, and most of the feed has no likes and no comments — so the
   * row read "♡ 0 💬 0" on card after card, spent about 24px saying nothing,
   * and on your own posts pushed the edit button far enough right that the
   * username was truncated to zero width and the heart landed on top of the
   * timestamp. The icon alone still says what the control does; the number
   * appears the moment there is a number worth showing.
   *
   * Desktop keeps its zeros. It has the room, and there the count sits beside
   * the word "Likes", where a bare icon would read as a missing value.
   */
  const showCount = (n: number) => !bare || n > 0;


  return (
    <div
      className={cn(
        "flex items-center justify-between",
        // The horizontal mobile card puts this on the same line as the byline,
        // where a rule across the top would cut the card in half.
        bare ? "gap-1" : "border-t border-story-ink/8 pt-3.5",
        className,
      )}
    >
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
                  aria-label={`${likes.length} ${likes.length === 1 ? "like" : "likes"}`}
                  className={cn(
                    "flex items-center rounded-full py-1.5 font-bold text-story-muted transition-all duration-200 hover:bg-story-green/10 hover:text-story-ink",
                    bare ? "gap-1 px-1.5" : "gap-2 px-3",
                  )}
                >
                  <Heart className={cn("h-4 w-4", likes.length > 0 && "fill-current text-[#d8453a]")} />
                  {showCount(likes.length) && <span className="text-sm">{likes.length}</span>}
                  <span className="hidden text-sm lg:inline">Likes</span>
                </Button>
              </PopoverTrigger>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={isLikePending}
                aria-label={isLiked ? "Unlike this verdict" : "Like this verdict"}
                className={cn(
                  "flex items-center gap-1.5 rounded-full py-1.5 font-bold transition-all duration-200",
                  bare ? "gap-1 px-1.5" : "gap-2 px-3",
                  isLiked ? "text-[#d8453a] hover:bg-[#d8453a]/10" : "text-story-muted hover:bg-story-green/10 hover:text-story-ink",
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                {/* The count doubles as the popover's trigger, so when it is
                    hidden the popover has no trigger — which is only ever the
                    case at zero likes, where there is nothing to list and no
                    `PopoverContent` rendered either. */}
                {showCount(likes.length) && (
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
                )}
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
          aria-label={`${commentsCount} ${commentsCount === 1 ? "comment" : "comments"}`}
          className={cn(
            "flex items-center rounded-full py-1.5 font-bold text-story-muted transition-all duration-200 hover:bg-story-green/10 hover:text-story-ink",
            bare ? "gap-1 px-1.5" : "gap-2 px-3",
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {showCount(commentsCount) && <span className="text-sm">{commentsCount}</span>}
          <span className="hidden text-sm lg:inline">Comments</span>
        </Button>

        {/* A bar-chart icon labelled "View All" used to sit here and navigate
            to the product page. Nothing about it said so, and the product name
            above — which is what someone would reach for anyway — now carries
            that link instead. This row is left with the two things that act on
            the post rather than leave it. */}
      </div>

      {isOwnPost && (
        /* Outlined on the desktop card, where it is the one call to action in
           a footer of its own. On the mobile card it shares a 195px line with
           the byline and both counts, and a ringed disc there reads as a third
           button competing with the two that matter — quieter and smaller, so
           the row fits and the name survives. */
        <Button
          variant={bare ? "ghost" : "outline"}
          size="sm"
          onClick={onEdit}
          aria-label="Edit your verdict"
          className={cn(
            "rounded-full p-0 hover:bg-story-green/10",
            bare ? "h-7 w-7 text-story-muted hover:text-story-ink" : "h-8 w-8 border-story-ink/15 text-story-ink",
          )}
        >
          <Edit3 className={cn(bare ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </Button>
      )}
    </div>
  );
};
