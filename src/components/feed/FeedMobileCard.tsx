import { formatDistanceToNow } from "date-fns";
import { getTier } from "@/components/story";
import { UserMark } from "@/components/story/UserMark";
import { humanizeLabels } from "@/lib/labels";
import { inferPlantBase } from "@/lib/plantBase";
import { cn } from "@/lib/utils";
import { MilkTestResult } from "@/types/milk-test";
import { useFeedItemState } from "./useFeedItemState";
import { FeedImage } from "./FeedImage";
import { FeedEngagement } from "./FeedEngagement";
import { FeedComments } from "./FeedComments";

interface FeedMobileCardProps {
  item: MilkTestResult;
}

/**
 * The mobile card is not the desktop card narrowed down — it is denser and
 * ordered for a thumb moving fast: score and product share the first line,
 * the photo is a supporting thumbnail rather than the hero, and the byline
 * drops the duplicate timestamp the top line already gave away.
 */
export const FeedMobileCard = ({ item }: FeedMobileCardProps) => {
  const {
    user,
    isOwnPost,
    likes,
    comments,
    isLiked,
    showComments,
    setShowComments,
    likeMutation,
    commentMutation,
    handleLike,
    handleComment,
    handleViewAllResults,
    handleEdit,
  } = useFeedItemState(item);

  const tier = getTier(item.rating);
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true }).replace("about ", "");
  const base = inferPlantBase(
    `${item.brand_name ?? ""} ${item.product_name ?? ""} ${(item.property_names ?? []).join(" ")}`,
  );
  const tags = [...(item.is_barista ? ["Barista"] : []), ...humanizeLabels(item.property_names)].slice(0, 2);

  return (
    <article id={`test-${item.id}`} className="story-hairline flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4">
      {/* Score and product share one line — the two things a thumb scrolling fast needs first. */}
      <div className="flex items-center gap-3">
        <span className="story-num flex-shrink-0 text-[1.6rem] leading-none" style={{ color: tier.color }}>
          {item.rating.toFixed(1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="story-serif truncate text-[0.9375rem] font-bold leading-tight text-story-ink" translate="no">
            {item.brand_name ?? "Unknown brand"} - {item.product_name ?? "Unknown product"}
          </p>
          <p className="mt-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em]" style={{ color: tier.color }}>
            {tier.name}
          </p>
        </div>
        <span className="flex-shrink-0 text-[0.6875rem] font-medium text-story-muted-2">{timeAgo}</span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "story-num flex h-5 flex-shrink-0 items-center rounded-md px-1.5 text-[0.5625rem] font-extrabold",
              base.bg,
              base.fg,
            )}
          >
            {base.abbr}
          </span>
          {tags.map((label) => (
            <span
              key={label}
              className="rounded-full bg-story-ink/[0.06] px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.04em] text-story-muted"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-24 flex-shrink-0">
          <FeedImage
            compact
            picturePath={item.picture_path}
            brandName={item.brand_name ?? "Unknown brand"}
            productName={item.product_name ?? "Unknown product"}
          />
        </div>
        {item.notes ? (
          <p className="story-serif line-clamp-4 flex-1 text-[0.8125rem] italic leading-snug text-story-ink-2">
            &ldquo;{item.notes}&rdquo;
          </p>
        ) : (
          <p className="flex-1 text-[0.8125rem] italic leading-snug text-story-muted-2">No note left.</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <UserMark name={item.username} className="h-6 w-6 text-[0.625rem]" />
        <span className="truncate text-[0.75rem] font-bold text-story-muted" translate="no">
          {item.username}
        </span>
      </div>

      <FeedEngagement
        likes={likes}
        commentsCount={comments.length}
        isLiked={isLiked}
        isOwnPost={isOwnPost}
        isLikePending={likeMutation.isPending}
        showComments={showComments}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
        onViewAllResults={handleViewAllResults}
        onEdit={handleEdit}
      />

      {showComments && (
        <FeedComments
          comments={comments}
          userEmail={user?.email}
          isCommentPending={commentMutation.isPending}
          onAddComment={handleComment}
        />
      )}
    </article>
  );
};
