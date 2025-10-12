import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
}

interface FeedCommentsProps {
  comments: Comment[];
  userEmail?: string;
  isCommentPending: boolean;
  onAddComment: (content: string) => void;
}

export const FeedComments = ({ comments, userEmail, isCommentPending, onAddComment }: FeedCommentsProps) => {
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {comments.map(comment => (
        <div key={comment.id} className="flex space-x-2 p-2 bg-muted/20 rounded-lg">
          <Avatar className="h-8 w-8 ring-1 ring-primary/10 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {comment.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground text-sm" translate="no">
                {comment.username}
              </span>
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-2.5 w-2.5 mr-1" />
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-foreground text-sm mt-1">{comment.content}</p>
          </div>
        </div>
      ))}

      {userEmail && (
        <div className="flex space-x-2 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-8 w-8 ring-1 ring-primary/10 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea 
              placeholder="Share your thoughts about this product..." 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="min-h-[80px] resize-none border-2 focus:border-primary"
            />
            <Button 
              size="sm" 
              onClick={handleComment}
              disabled={!commentText.trim() || isCommentPending}
              className="px-6 py-2 rounded-full"
            >
              {isCommentPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
