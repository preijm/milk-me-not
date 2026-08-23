import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ScoreMark } from "@/components/story";
import { UserMark } from "@/components/story/UserMark";
import { ProductIdentity } from "@/components/story/ProductIdentity";
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
    handleEdit,
  } = useFeedItemState(item);

  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true }).replace("about ", "");

  return (
    <article id={`test-${item.id}`} className="story-hairline flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4">
      {/* Who, when and how they scored it, in one place.
          These three were spread across the card: the time sat top-right, the
          name four rows below it at the foot, and the tier word hung under the
          product name in the identity column rather than beside the score it
          describes. */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserMark name={item.username} className="h-8 w-8 text-[0.75rem]" />
          <span className="min-w-0">
            <span className="block truncate text-[0.8125rem] font-bold text-story-ink" translate="no">
              {item.username}
            </span>
            <span className="block text-[0.6875rem] font-medium text-story-muted-2">{timeAgo}</span>
          </span>
        </div>
        <ScoreMark score={item.rating} size="sm" className="shrink-0" />
      </div>

      {/* The mark comes back now that the score has moved off the left edge,
          so a carton looks the same here as it does on the board. */}
      <Link to={`/product/${item.product_id}`} className="no-underline">
        <ProductIdentity
          brand={item.brand_name}
          product={item.product_name}
          properties={item.property_names}
          flavors={item.flavor_names}
          isBarista={item.is_barista}
          size="sm"
          maxBadges={2}
        />
      </Link>

      {/* This row cost 112px to show 18px of note. The photo set the height
          and the note sat beside it, so a one-line tasting note — which is
          most of them — left about 94px of white space, and a card with
          neither photo nor note still announced "No note left."
          The photo is a thumbnail now, and each piece only appears if it
          exists. */}
      {(item.picture_path || item.notes) && (
        <div className="flex items-start gap-3">
          {item.picture_path && (
            <div className="w-20 shrink-0">
              <FeedImage
                compact
                picturePath={item.picture_path}
                brandName={item.brand_name ?? "Unknown brand"}
                productName={item.product_name ?? "Unknown product"}
              />
            </div>
          )}
          {item.notes && (
            <p className="story-serif line-clamp-3 flex-1 self-center text-[0.8125rem] italic leading-snug text-story-ink-2">
              &ldquo;{item.notes}&rdquo;
            </p>
          )}
        </div>
      )}

      <FeedEngagement
        likes={likes}
        commentsCount={comments.length}
        isLiked={isLiked}
        isOwnPost={isOwnPost}
        isLikePending={likeMutation.isPending}
        showComments={showComments}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
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
