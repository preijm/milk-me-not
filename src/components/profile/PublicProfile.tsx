import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { Seo } from "@/components/Seo";
import { usePublicProfile, type PublicRating } from "@/hooks/usePublicProfile";
import { humanizeLabel } from "@/lib/labels";
import { UserMark } from "@/components/story/UserMark";
import {
  ArrowRight,
  Band,
  BrandMark,
  CrestDivider,
  Display,
  Kicker,
  Lede,
  MilkDrop,
  Pour,
  Sprig,
  StoryButton,
  StoryLayout,
  StoryLinkButton,
  getPriceQuality,
  getTier,
} from "@/components/story";

/** Ratings revealed per batch — a prolific rater has hundreds. */
const PAGE_SIZE = 12;

const relativeDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const RatingRow = ({ rating }: { rating: PublicRating }) => {
  const tier = getTier(rating.rating);
  const pq = getPriceQuality(rating.priceQuality);

  return (
    <li className="border-t border-story-ink/[0.08] last:border-b">
      <Link
        to={rating.productId ? `/product/${rating.productId}` : "/results"}
        className="group flex items-start gap-4 py-5 no-underline"
      >
        <BrandMark
          brand={rating.brand}
          product={rating.product}
          className="mt-0.5 h-11 w-11 text-[0.7rem]"
          radius="rounded-xl"
        />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem]">
            <span className="font-medium text-story-muted">{rating.brand}</span>
            <span className="mx-1.5 text-story-muted-2">·</span>
            <span className="font-bold text-story-ink group-hover:underline">{rating.product}</span>
          </span>
          {rating.notes && (
            <span className="mt-1.5 block text-[0.875rem] italic leading-relaxed text-story-ink-2">
              “{rating.notes}”
            </span>
          )}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-story-muted-2">
            <span>{relativeDate(rating.createdAt)}</span>
            {rating.drinkPreference && <span>· {humanizeLabel(rating.drinkPreference)}</span>}
            {pq && (
              <span style={{ color: pq.color }}>· {pq.label}</span>
            )}
          </span>
        </span>

        <span className="flex flex-shrink-0 flex-col items-end leading-none">
          <span className="story-num text-[1.6rem]" style={{ color: tier.color }}>
            {rating.rating.toFixed(1)}
          </span>
          <span className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: tier.color }}>
            {tier.name}
          </span>
        </span>
      </Link>
    </li>
  );
};

/**
 * A rater's public page.
 *
 * Shared as a link, so it has to introduce a stranger to both the person and
 * the project: who they are, how hard they mark, and what they would buy again.
 */
export const PublicProfile = ({ userId }: { userId: string }) => {
  const { data, isLoading } = usePublicProfile(userId);
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (isLoading) {
    return (
      <StoryLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader className="h-7 w-7 animate-spin text-story-green" aria-label="Loading" />
        </div>
      </StoryLayout>
    );
  }

  if (!data) {
    return (
      <StoryLayout>
        <Seo title="Profile not found — Milk Me Not" description="No such rater." path={`/profile/${userId}`} noindex />
        <Band ground="forest" size="lg" className="flex min-h-[38vh] flex-col justify-center text-center sm:min-h-[55vh]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-12 hidden text-story-green lg:block">
            <MilkDrop size={260} variant="solid" />
          </div>
          <div className="relative mx-auto max-w-md">
            <Display size="xl" className="text-white">
              No such rater.
            </Display>
            <p className="mt-4 text-[1.0625rem] text-white/70">
              That profile does not exist, or its owner has never logged a carton.
            </p>
            <StoryLinkButton to="/feed" tone="paper" className="mt-8">
              See who is rating
              <ArrowRight />
            </StoryLinkButton>
          </div>
        </Band>
      </StoryLayout>
    );
  }

  const avgTier = getTier(data.average ?? undefined);
  const shown = data.ratings.slice(0, visible);
  const remaining = data.total - shown.length;

  const temperament =
    data.average === null
      ? null
      : data.average >= 7.5
        ? "A generous marker."
        : data.average >= 5.5
          ? "Hard but fair."
          : "A tough crowd.";

  return (
    <StoryLayout>
      <Seo
        title={`${data.username} — ratings on Milk Me Not`}
        description={`${data.username} has scored ${data.total} plant milk${data.total === 1 ? "" : "s"} on Milk Me Not.`}
        path={`/profile/${data.id}`}
      />

      {/* ── Who they are ─────────────────────────────────────────────── */}
      <Band ground="cream" size="hero">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-16 hidden text-story-green-light lg:block">
          <MilkDrop size={280} variant="solid" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt=""
              className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
              width={112}
              height={112}
            />
          ) : (
            <UserMark
              name={data.username}
              letters={2}
              radius="rounded-2xl"
              className="story-serif h-20 w-20 text-[1.9rem] sm:h-28 sm:w-28 sm:text-[2.6rem]"
            />
          )}

          <div className="min-w-0">
            <Kicker>{data.since ? `Rating since ${data.since}` : "Community member"}</Kicker>
            <Display as="h1" size="xl" className="mt-3 break-words">
              {data.username}
            </Display>
            <Lede className="mt-3">
              {temperament} {data.favouriteBase && `Mostly ${data.favouriteBase.label.toLowerCase()}.`} One of the
              people scoring every plant milk on the shelf at Milk Me Not.
            </Lede>
          </div>
        </div>

        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-story-ink/[0.08] pt-8 sm:grid-cols-4">
          <div>
            <dd className="story-num text-[clamp(1.9rem,6vw,2.75rem)] leading-none text-story-ink">{data.total}</dd>
            <dt className="story-kicker mt-2 text-story-muted-2">Ratings</dt>
          </div>
          <div>
            <dd className="story-num text-[clamp(1.9rem,6vw,2.75rem)] leading-none" style={{ color: avgTier.color }}>
              {data.average === null ? "—" : data.average.toFixed(1)}
            </dd>
            <dt className="story-kicker mt-2 text-story-muted-2">Average given</dt>
          </div>
          <div>
            <dd className="story-num text-[clamp(1.9rem,6vw,2.75rem)] leading-none text-story-ink">
              {data.best ? data.best.rating.toFixed(1) : "—"}
            </dd>
            <dt className="story-kicker mt-2 text-story-muted-2">Highest given</dt>
          </div>
          <div>
            <dd className="story-num text-[clamp(1.9rem,6vw,2.75rem)] leading-none text-story-ink">
              {data.worst ? data.worst.rating.toFixed(1) : "—"}
            </dd>
            <dt className="story-kicker mt-2 text-story-muted-2">Lowest given</dt>
          </div>
        </dl>
      </Band>

      {/* ── How they mark ────────────────────────────────────────────── */}
      {data.total > 0 && (
        <>
          <div className="text-story-paper">
            <CrestDivider className="block h-12 w-full sm:h-20" />
          </div>

          <Band ground="paper" size="md">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-8 hidden text-story-green-light lg:block">
              <Pour size={220} />
            </div>
            <Kicker>How they mark</Kicker>
            <Display size="lg" className="mt-4 max-w-2xl">
              {data.best && (
                <>
                  Best thing they've drunk:{" "}
                  <span className="text-story-green">{data.best.product}</span>
                </>
              )}
            </Display>

            <ul className="mt-9 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
              {data.spread
                .sort((a, b) => b.count - a.count)
                .map((band) => (
                  <li
                    key={band.name}
                    className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 sm:flex-col sm:items-start sm:gap-1.5"
                    style={{ backgroundColor: `${band.color}18` }}
                  >
                    <span className="story-num text-[1.5rem] leading-none" style={{ color: band.color }}>
                      {band.count}
                    </span>
                    <span
                      className="text-[0.6875rem] font-bold uppercase tracking-[0.14em]"
                      style={{ color: band.color }}
                    >
                      {band.name}
                    </span>
                  </li>
                ))}
            </ul>
          </Band>
        </>
      )}

      {/* ── Everything they've rated ─────────────────────────────────── */}
      <Band ground={data.total > 0 ? "cream" : "paper"} size="lg">
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-8 hidden text-story-green-dark opacity-[0.07] lg:block">
          <Sprig size={240} />
        </div>
        <Kicker>The receipts</Kicker>
        <Display size="lg" className="mt-4">
          {data.total > 0 ? `Every carton, most recent first` : "Nothing logged yet"}
        </Display>

        {data.total === 0 ? (
          <Lede className="mt-4 max-w-lg">
            {data.username} has an account but has not scored anything yet. Somebody should go first.
          </Lede>
        ) : (
          <>
            <ol className="mt-9">
              {shown.map((rating) => (
                <RatingRow key={rating.id} rating={rating} />
              ))}
            </ol>

            {remaining > 0 && (
              <div className="mt-9 flex flex-col items-center gap-3">
                <StoryButton tone="outline" size="md" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Show {Math.min(remaining, PAGE_SIZE)} more
                </StoryButton>
                <p className="text-[0.8125rem] font-medium text-story-muted-2">
                  {shown.length} of {data.total} shown
                </p>
              </div>
            )}
          </>
        )}
      </Band>
    </StoryLayout>
  );
};

export default PublicProfile;
