import { Link } from "react-router-dom";

import { ArrowRight, ScoreMark } from "@/components/story";
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
 * "5h", not "5 hours ago".
 *
 * The byline shares its line with the like and comment buttons in a column
 * about 190px wide. Spelled out, the timestamp took enough of it that the
 * username was squeezed to zero width and vanished — the card named nobody.
 */
const shortAgo = (iso: string) => {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const mins = Math.floor(secs / 60);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
};

/**
 * The mobile card is not the desktop card narrowed down — it is denser and
 * ordered for a thumb moving fast.
 *
 * It reads across rather than down. Every photo on this feed is portrait —
 * eight of eight measured, mostly 3000×4000 straight off a phone — so standing
 * one up on the left gives it its own shape back instead of cropping a
 * letterbox out of the middle, and leaves the right-hand column for everything
 * that is words.
 *
 * Desktop keeps its masonry grid of vertical cards: a column there is about
 * 440px, and a portrait photo beside a text column needs more than that.
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

  const timeAgo = shortAgo(item.created_at);

  return (
    <article id={`test-${item.id}`} className="story-hairline w-full rounded-2xl bg-white p-3">
      <div className="flex gap-3">
        {item.picture_path && (
          <div className="w-26 shrink-0">
            <FeedImage
              portrait
              picturePath={item.picture_path}
              brandName={item.brand_name ?? "Unknown brand"}
              productName={item.product_name ?? "Unknown product"}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            {/* No mark beside the name: the photo is the picture of this
                carton, and a logo tile next to it would be a second one.
                The arrow is the only thing saying this goes somewhere — there
                is no hover on a phone to discover it with. */}
            <Link
              to={`/product/${item.product_id}`}
              className="group -m-1 min-w-0 rounded-lg p-1 no-underline active:bg-story-cream-2"
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
                after={<ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-story-muted-2" />}
              />
            </Link>
            {/* Right-aligned so scores line up down the feed. At sm it read as
                stranded in the corner; md gives it the weight to anchor it. */}
            <ScoreMark score={item.rating} size="md" className="shrink-0 flex-col items-end gap-0" />
          </div>

          {item.notes && (
            <p className="story-serif line-clamp-3 text-[0.8125rem] italic leading-snug text-story-ink-2">
              &ldquo;{item.notes}&rdquo;
            </p>
          )}

          {/* Who left it, and what it drew, on the last line — the two things
              you act on rather than read. */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            {/* flex-1 + min-w-0 on the byline and shrink-0 on the actions:
                without it the engagement row claimed the whole line and
                squeezed the username to zero width. */}
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              <UserMark name={item.username} className="h-6 w-6 text-[0.625rem]" />
              <span className="min-w-0 truncate text-[0.75rem] font-bold text-story-ink" translate="no">
                {item.username}
              </span>
              <span className="shrink-0 text-[0.6875rem] text-story-muted-2">· {timeAgo}</span>
            </span>
            <FeedEngagement
              bare
              className="shrink-0"
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
          </div>
        </div>
      </div>

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
