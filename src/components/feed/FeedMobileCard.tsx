import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getTier } from "@/components/story";
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

  const tier = getTier(item.rating);
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true }).replace("about ", "");

  return (
    <article id={`test-${item.id}`} className="story-hairline flex w-full flex-col gap-2.5 rounded-2xl bg-white p-4">
      {/* Score and product share one line — the two things a thumb scrolling fast needs first. */}
      <div className="flex items-center gap-3">
        <span className="story-num flex-shrink-0 text-[1.6rem] leading-none" style={{ color: tier.color }}>
          {item.rating.toFixed(1)}
        </span>
        {/* No mark: the score already holds the left edge of this row. The
            badges come with the identity now, which is why the separate tag
            strip below this header is gone — it carried a base chip and the
            properties but dropped flavours, so two flavours of one carton
            looked identical here. */}
        <Link
          to={`/product/${item.product_id}`}
          className="min-w-0 flex-1 no-underline"
        >
          <ProductIdentity
            brand={item.brand_name}
            product={item.product_name}
            properties={item.property_names}
            flavors={item.flavor_names}
            isBarista={item.is_barista}
            size="sm"
            showMark={false}
            maxBadges={2}
          />
          <p className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.08em]" style={{ color: tier.color }}>
            {tier.name}
          </p>
        </Link>
        <span className="flex-shrink-0 text-[0.6875rem] font-medium text-story-muted-2">{timeAgo}</span>
      </div>

      {/* This row cost 112px to show 18px of note. The photo set the height
          and the note sat beside it, so a one-line tasting note — which is
          most of them — left about 94px of white space, and a card with
          neither photo nor note still announced "No note left."
          The photo is a thumbnail now, and each piece only appears if it
          exists. */}
      {(item.picture_path || item.notes) && (
        <div className="flex items-start gap-3">
          {item.picture_path && (
            <div className="w-20 flex-shrink-0">
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
