import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { StoryButton } from "@/components/story";

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
    <div className="flex flex-col gap-3 border-t border-story-ink/[0.08] pt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2.5">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-story-ink/[0.06] text-xs font-bold text-story-ink"
            aria-hidden
          >
            {comment.username?.charAt(0).toUpperCase() || "U"}
          </span>
          <div className="min-w-0 flex-1 rounded-xl bg-story-cream-2 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="truncate text-[0.8125rem] font-bold text-story-ink" translate="no">
                {comment.username}
              </span>
              <span className="text-[0.6875rem] font-medium text-story-muted-2">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }).replace("about ", "")}
              </span>
            </div>
            <p className="mt-0.5 text-[0.875rem] leading-relaxed text-story-ink-2">{comment.content}</p>
          </div>
        </div>
      ))}

      {userEmail && (
        <div className="flex items-start gap-2.5 pt-1">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-story-green text-xs font-bold text-white"
            aria-hidden
          >
            {userEmail.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="What did you think?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[70px] resize-none border-story-ink/15 focus-visible:ring-story-green"
            />
            <StoryButton tone="green" size="sm" onClick={handleComment} disabled={!commentText.trim() || isCommentPending}>
              {isCommentPending ? "Posting…" : "Post comment"}
            </StoryButton>
          </div>
        </div>
      )}
    </div>
  );
};
