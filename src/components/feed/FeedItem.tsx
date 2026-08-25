import { MilkTestResult } from "@/types/milk-test";
import { ArrowRight, ScoreMark } from "@/components/story";
import { useFeedItemState } from "./useFeedItemState";
import { Link } from "react-router-dom";
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
    handleEdit,
  } = useFeedItemState(item);

  return (
    <article id={`test-${item.id}`} className="story-hairline flex w-full flex-col gap-5 rounded-[1.25rem] bg-white p-5">
      {/* Who, when and how they scored it, together. The byline used to sit at
          the foot of the card, so the score at the top belonged to nobody until
          you had scrolled past the photo and the note to find out whose opinion
          it was.

          The tier's blurb used to hang under the score, and it was the fourth
          way this corner said one thing: 6.7, the word GOOD, the green they are
          both printed in, and then "Worth the shelf space." Down a masonry
          column it also repeated — every card above 8 read "Buy two." The blurb
          still earns its place where a tier is being explained rather than
          reported: the FAQ scale, the rating slider as you drag it, a product's
          own page. Not once per card, five cards deep. */}
      <div className="flex items-start justify-between gap-4">
        <FeedHeader
          username={item.username ?? undefined}
          createdAt={item.created_at}
          className="min-w-0 flex-1"
        />
        <ScoreMark score={item.rating} size="lg" className="shrink-0 justify-end" />
      </div>

      {/* The carton and the picture of the carton are one object, and the card
          was not saying so. Name, photo and note sat in a single 16px rhythm
          with everything else, so the identity read as one more strip rather
          than as the caption to the photo under it. They share a clipped,
          hairlined block now, and the gap around that block is wider than the
          gap inside it — which is the whole trick.

          Two hovers, because there are two destinations: the name goes to the
          product, the photo opens itself. */}
      <div className="story-hairline overflow-hidden rounded-xl">
        {/* The product name is the link to the product. It is what someone
            reaches for, and it replaces a bar-chart icon labelled "View All"
            that went to the same place without saying so.

            The arrow is what says so out loud. A tint that only appears under
            the cursor tells you a row is a link *after* you have already found
            it, which is no help to anyone deciding where to point — and none
            at all on a touchscreen, which is why the mobile card has carried
            one since it was built. Pinned to the right rather than tucked
            after the name, because the whole strip is the target, not the
            three words. */}
        <Link
          to={`/product/${item.product_id}`}
          className="story-linked-product group flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-story-cream-2"
        >
          <FeedProductInfo
            className="min-w-0 flex-1"
            brandName={item.brand_name ?? "Unknown brand"}
            productName={item.product_name ?? "Unknown product"}
            isBarista={item.is_barista ?? undefined}
            propertyNames={item.property_names ?? undefined}
            flavorNames={item.flavor_names ?? undefined}
          />
          <ArrowRight className="shrink-0 text-story-muted transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-story-green-dark" />
        </Link>

        <FeedImage
          className="rounded-none"
          picturePath={item.picture_path}
          brandName={item.brand_name ?? "Unknown brand"}
          productName={item.product_name ?? "Unknown product"}
        />
      </div>

      {item.notes && (
        <p className="story-serif rounded-xl bg-story-cream px-4 py-3 text-[0.9375rem] italic leading-relaxed text-story-ink-2">
          &ldquo;{item.notes}&rdquo;
        </p>
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
