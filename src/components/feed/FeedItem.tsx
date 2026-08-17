import { MilkTestResult } from "@/types/milk-test";
import { ScoreMark, getTier } from "@/components/story";
import { useFeedItemState } from "./useFeedItemState";
import { FeedHeader } from "./FeedHeader";
import { FeedProductInfo } from "./FeedProductInfo";
import { FeedImage } from "./FeedImage";
import { FeedEngagement } from "./FeedEngagement";
import { FeedComments } from "./FeedComments";

interface FeedItemProps {
  item: MilkTestResult;
}

/**
 * The desktop verdict card, read top to bottom the way the brief wants it:
 * the score at scale with its named tier, the product, the note, then who
 * and when. Behaviour (likes, comments, edit) comes from `useFeedItemState`,
 * shared with the mobile card so the two layouts never disagree on function.
 */
export const FeedItem = ({ item }: FeedItemProps) => {
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

  return (
    <article id={`test-${item.id}`} className="story-hairline flex w-full flex-col gap-4 rounded-[1.25rem] bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <ScoreMark score={item.rating} size="lg" />
        <span className="text-right text-[0.8125rem] font-medium italic leading-snug text-story-muted-2">
          {tier.blurb}
        </span>
      </div>

      <FeedProductInfo
        brandName={item.brand_name ?? "Unknown brand"}
        productName={item.product_name ?? "Unknown product"}
        isBarista={item.is_barista ?? undefined}
        propertyNames={item.property_names ?? undefined}
        flavorNames={item.flavor_names ?? undefined}
      />

      <FeedImage
        picturePath={item.picture_path}
        brandName={item.brand_name ?? "Unknown brand"}
        productName={item.product_name ?? "Unknown product"}
      />

      {item.notes && (
        <p className="story-serif rounded-xl bg-story-cream px-4 py-3 text-[0.9375rem] italic leading-relaxed text-story-ink-2">
          &ldquo;{item.notes}&rdquo;
        </p>
      )}

      <FeedHeader username={item.username ?? undefined} createdAt={item.created_at} rating={item.rating} />

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
