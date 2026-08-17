import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoryButton, ArrowRight } from "@/components/story/primitives";
import { DropGlyph } from "@/components/story/motifs";
import { BrandMark } from "@/components/story/BrandMark";
import { QuickRateSheet } from "@/components/story/QuickRateSheet";
import { getTier } from "@/components/story/tiers";
import type { MilkTestResult } from "@/types/milk-test";

interface ProfileContentProps {
  username: string;
  email: string;
  avatarUrl?: string | null;
  totalTests: number;
  avgRating: string;
  bestScore: number;
  memberSince: string;
  onEditClick: () => void;
  onSignOut: () => void;
  /** The reader's own ratings, so they can revisit or retract one. */
  ratings?: MilkTestResult[];
}

const Figure = ({ label, value }: { label: string; value: string }) => (
  <div className="story-hairline rounded-2xl bg-white p-4">
    <p className="story-kicker text-story-muted-2">{label}</p>
    <p className="story-num mt-1.5 text-[1.75rem] leading-none text-story-ink">{value}</p>
  </div>
);

/**
 * One responsive implementation, not two.
 *
 * This previously branched on a `variant` prop into a card grid for phones and
 * an entirely separate desktop arm built from ProfileHeader / ProfileStats /
 * ProfileActions — the same information twice, drifting apart, with the desktop
 * sign-out styled as a destructive red button as though leaving were dangerous.
 */
export const ProfileContent = ({
  username,
  email,
  avatarUrl,
  totalTests,
  avgRating,
  bestScore,
  memberSince,
  onEditClick,
  onSignOut,
  ratings = [],
}: ProfileContentProps) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState<MilkTestResult | null>(null);

  return (
    <div className="space-y-6">
      <section className="story-hairline flex flex-col gap-5 rounded-3xl bg-white p-5 sm:flex-row sm:items-center sm:p-7">
        <button
          onClick={onEditClick}
          className="group relative shrink-0 self-start rounded-full sm:self-auto"
          aria-label="Change your picture"
        >
          <Avatar className="h-20 w-20 ring-1 ring-story-ink/10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-story-green-wash">
              <DropGlyph className="h-8 w-8 text-story-green-dark" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-story-ink/50 text-[0.6875rem] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
            Change
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="story-display truncate text-[1.6rem] text-story-ink">{username}</h2>
          <p className="truncate text-[0.875rem] text-story-muted">{email}</p>
          <p className="mt-1 text-[0.8125rem] text-story-muted-2">Rating since {memberSince}</p>
        </div>

        <StoryButton tone="outline" size="sm" onClick={onSignOut} className="shrink-0 self-start sm:self-auto">
          Sign out
        </StoryButton>
      </section>

      <section>
        <h3 className="story-kicker mb-3 px-1 text-story-muted-2">What you have poured</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Figure label="Ratings" value={String(totalTests)} />
          <Figure label="Your average" value={totalTests > 0 ? avgRating : "—"} />
          <Figure label="Best score" value={bestScore > 0 ? String(bestScore) : "—"} />
          <Figure label="Joined" value={memberSince} />
        </div>
      </section>

      <section>
        <h3 className="story-kicker mb-3 px-1 text-story-muted-2">Carry on</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/results", { state: { myResultsOnly: true } })}
            className="story-hairline group flex items-center justify-between rounded-2xl bg-white p-4 text-left transition-colors hover:bg-story-cream-2"
          >
            <span>
              <span className="block text-[0.9375rem] font-bold text-story-ink">Everything you rated</span>
              <span className="block text-[0.8125rem] text-story-muted">Your scores on the board</span>
            </span>
            <ArrowRight className="shrink-0 text-story-muted-2 transition-colors group-hover:text-story-green-dark" />
          </button>
          <button
            onClick={() => navigate("/add")}
            className="group flex items-center justify-between rounded-2xl bg-story-green p-4 text-left text-white story-lift-green transition-transform hover:brightness-[1.07]"
          >
            <span>
              <span className="block text-[0.9375rem] font-bold">Rate another milk</span>
              <span className="block text-[0.8125rem] text-white/80">Takes about a minute</span>
            </span>
            <ArrowRight className="shrink-0" />
          </button>
        </div>
      </section>

      {/* Until now there was no route to your own ratings at all: the components
          for editing one existed but nothing imported them, so a rating could be
          posted and never corrected or withdrawn. */}
      <section>
        <h3 className="story-kicker mb-3 px-1 text-story-muted-2">
          {ratings.length > 0 ? "Every one you have posted" : "Nothing rated yet"}
        </h3>

        {ratings.length === 0 ? (
          <div className="story-hairline rounded-2xl bg-white p-5 text-center">
            <p className="text-[0.9375rem] text-story-muted">
              Rate your first carton and it will show up here, where you can change your mind later.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ratings.map((r) => {
              const tier = getTier(r.rating);
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setEditing(r)}
                    className="story-hairline flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-colors hover:bg-story-cream-2"
                  >
                    <BrandMark
                      brand={r.brand_name}
                      product={r.product_name}
                      className="h-11 w-11 shrink-0"
                      radius="rounded-xl"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-bold text-story-ink">
                        {r.product_name || "Unknown product"}
                      </span>
                      <span className="block truncate text-[0.8125rem] text-story-muted">
                        {r.brand_name || "Unknown brand"}
                        {r.notes ? ` — ${r.notes}` : ""}
                      </span>
                    </span>
                    <span
                      className="story-num shrink-0 rounded-lg px-2.5 py-1 text-[0.9375rem] text-white"
                      style={{ backgroundColor: tier.color }}
                    >
                      {r.rating}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing?.product_id && (
        <QuickRateSheet
          open
          onOpenChange={(next) => !next && setEditing(null)}
          productId={editing.product_id}
          productName={editing.product_name || "This milk"}
          brandName={editing.brand_name}
          onSaved={() => setEditing(null)}
        />
      )}
    </div>
  );
};
